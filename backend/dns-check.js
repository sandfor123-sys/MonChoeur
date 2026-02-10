const dns = require('dns');

const host = 'db.kasyxxpcxkjkominhitc.supabase.co';

console.log(`Checking ${host}...`);

dns.resolve4(host, (err, addresses) => {
    if (err) {
        console.error('❌ No IPv4 found:', err.code);
    } else {
        console.log('✅ IPv4 addresses:', addresses);
    }

    dns.resolve6(host, (err, addresses) => {
        if (err) {
            console.error('❌ No IPv6 found:', err.code);
        } else {
            console.log('✅ IPv6 addresses:', addresses);
        }
        process.exit();
    });
});
