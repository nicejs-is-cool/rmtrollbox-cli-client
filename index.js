const argv = process.argv.slice(2);

if(argv[0] === "--help") {
    console.log("Usage: rmtrollbox [--help] [--new]\nNOTE: --new is not yet implemented");
    process.exit(0);
}
require('./old');