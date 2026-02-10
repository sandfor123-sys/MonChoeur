const { testConnection } = require('./src/config/database');

async function runTest() {
    console.log('🔍 Test de connexion Supabase SDK...');
    try {
        const success = await testConnection();
        if (success) {
            console.log('🎊 Félicitations ! La connexion via SDK est opérationnelle.');
        } else {
            console.log('😰 Échec de la connexion SDK.');
        }
    } catch (e) {
        console.error('❌ Error testing connection:', e);
    }
    // Give it a second before exit
    setTimeout(() => {
        process.exit(0);
    }, 2000);
}

runTest();
