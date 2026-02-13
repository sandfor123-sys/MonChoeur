const { supabase } = require('./src/config/database');

async function checkCounts() {
    console.log('🔍 Checking database counts...');
    try {
        const { count, error } = await supabase
            .from('chants')
            .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        console.log(`✅ Total chants in database: ${count}`);
        
        if (count >= 15) {
            console.log('✨ [MH7] Requirement met: 15+ chants found.');
        } else {
            console.log(`⚠️ [MH7] Requirement not met: Only ${count} chants found (need 15-20).`);
        }
    } catch (e) {
        console.error('❌ Error checking counts:', e.message);
    }
    process.exit(0);
}

checkCounts();
