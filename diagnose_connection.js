// Test script to diagnose Supabase connection and permissions
async function diagnoseConnection() {
  try {
    // Check if Supabase is configured
    if (!window.supabase) {
      console.log("❌ Supabase client not available");
      return;
    }
    
    console.log("✅ Supabase client is available");
    
    // Test basic connection
    const { data: testData, error: testError } = await window.supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log("❌ Basic query failed:", testError.message);
    } else {
      console.log("✅ Basic connection to products table works");
    }
    
    // Check current user session
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    
    if (sessionError) {
      console.log("❌ Session error:", sessionError.message);
    } else if (session) {
      console.log("✅ User is logged in:", session.user.email);
      
      // Check if user has admin rights
      const { data: profile, error: profileError } = await window.supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.log("❌ Profile error:", profileError.message);
        console.log("   This might mean the user doesn't have a profile or the profiles table doesn't exist properly");
      } else {
        console.log("✅ User profile found, is_admin:", profile.is_admin);
        if (!profile.is_admin) {
          console.log("❌ User is not an admin - won't have permission for admin operations");
        }
      }
    } else {
      console.log("⚠️ No active session - user needs to log in");
    }
    
    // Check if storage is accessible
    try {
      const { data, error } = await window.supabase.storage.from('product-images').list('', { limit: 1 });
      if (error) {
        console.log("❌ Storage access error:", error.message);
      } else {
        console.log("✅ Storage bucket 'product-images' is accessible");
      }
    } catch (storageError) {
      console.log("❌ Storage error:", storageError.message);
    }
    
  } catch (error) {
    console.log("❌ Unexpected error:", error.message);
  }
}

// Run the diagnosis
diagnoseConnection().then(() => {
  console.log("Diagnosis complete. Check the console for details.");
});