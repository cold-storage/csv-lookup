#!/usr/bin/env node

const cmd = require('commander');
const nada = '';

/*

./csv-lookup.js -l out/opp-legacy-payment-number.csv \
  -k Legacy_Payment_Number__c -v Id \
  -s Legacy_Payment_Number__c \
  < out/opp-legacy-payment-number.csv \
  > out/olpn.csv

*/

cmd
  .description(`${nada}Add or replace a column value in source CSV file
  with lookup from another CSV file.

  csv-lookup.js -s PersonId \\
    -l lookup.csv -k Id -v Name \\
    < source.csv \\
    > output.csv

  This has been tested on a 2016 MacBook Pro with 16 GB RAM
  on lookup file with over 2 million rows. YMMV.

  Because of streaming, the source file can be any size.`)
  .option('-s, --sourceField <name>', 'Source file key field')
  .option('-l, --lookupFile <name>', 'Lookup file name')
  .option('-k, --keyField <name>', 'Lookup file key field')
  .option('-v, --valueField <name>', 'Lookup file value field')
  .option('-i, --insertField [name]', 'Field to add to source file')
  .option('-x, --removeRowIfNoMatch', 'Remove rows form source file if no match')
  .parse(process.argv);

if (!cmd.sourceField || !cmd.keyField || !cmd.valueField || !cmd.lookupFile) {
  cmd.help();
}

const lookup = {};
let count = 0;

require('csv-stream-transform')({
  transform(row, cb) {
    if (row[cmd.keyField]) {
      lookup[row[cmd.keyField]] = row[cmd.valueField];
    }
    cb();
  },
  in: require('fs').createReadStream(cmd.lookupFile),
  out: 'NOOUT',
  finish: () => {
    require('csv-stream-transform')({
      transform(row, cb) {
        const val = lookup[row[cmd.sourceField]];
        if (cmd.insertField) {
          row[cmd.insertField] = val;
        } else {
          row[cmd.sourceField] = val;
        }
        if (cmd.removeRowIfNoMatch && !val) {
          cb();
        } else {
          cb(null, row);
        }
      }
    });
  }
});
