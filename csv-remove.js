#!/usr/bin/env node

const cmd = require('commander');
const nada = '';

/*

Here's another use case for doing a lookup. You want to remove rows that
either match or don't match the lookup.

Would be nice to collect all these use cases and organize them for easy
use.

./csv-remove.js \
  -s Legacy_Record_Number__c \
  -l out/opp.leg.rec.no.csv -k Legacy_Record_Number__c \
  < out/sf-insert/opportunity.csv \
  > out/missing.opps.what.csv

*/

cmd
  .description(`${nada}Remove rows from source CSV file
  that match (or don't match) lookup from another CSV file.
  csv-lookup.js -s PersonId \\
    -l lookup.csv -k Id \\
    < source.csv \\
    > output.csv
  This has been tested on a 2016 MacBook Pro with 16 GB RAM
  on lookup file with over 2 million rows. YMMV.
  Because of streaming, the source file can be any size.`)
  .option('-s, --sourceField <name>', 'Source file key field')
  .option('-l, --lookupFile <name>', 'Lookup file name')
  .option('-k, --keyField <name>', 'Lookup file key field')
  .option('-n, --removeNonMatches', 'Remove rows that do not match')
  .parse(process.argv);

if (!cmd.sourceField || !cmd.keyField || !cmd.lookupFile) {
  cmd.help();
}

const lookup = {};
let count = 0;

require('csv-stream-transform')({
  transform(row, cb) {
    if (row[cmd.keyField]) {
      count++;
      lookup[row[cmd.keyField]] = true;
    }
    cb();
  },
  in: require('fs').createReadStream(cmd.lookupFile),
  out: 'NOOUT',
  finish: () => {
    console.error(count + ' lookup rows');
    count = 0;
    require('csv-stream-transform')({
      transform(row, cb) {
        const val = lookup[row[cmd.sourceField]];
        if (cmd.removeNonMatches && !val) {
          row = null;
        }
        if (!cmd.removeNonMatches && val) {
          row = null;
        }
        if (row) count++;
        cb(null, row);
      },
      finish: () => {
        console.error(count + ' output rows');
      }
    });
  }
});