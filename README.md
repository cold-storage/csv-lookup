# csv-lookup

Add or replace a column value in source CSV file with lookup from another CSV
file.

## Install

```bin
npm i -g csv-lookup
```

## Enjoy

The following replaces the PersonId column in source.csv with the value of the
Name column in lookup.csv where PersonId from source matches Id from lookup.

```bin
csv-lookup.js -s PersonId \\
  -l lookup.csv -k Id -v Name \\
  < source.csv \\
  > output.csv
```

For extended help, type the command name with no arguments.

You can optionally add a column to the source.csv instead of replacing the
value of the column.

You can also optionally remove rows where there is no match.