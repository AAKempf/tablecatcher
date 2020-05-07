# Excel via WordPress to morris.js

Under WordPress Excel with two plugins and JavaScript to morris.js as diagrams

## Import Excel data as CSV

For this purpose the plugin TablePress is required in WordPress.

After data has been imported, it is available as [table id=xx]. 

In the TablePress plugin the option "Use DataTable" must be switched off to get the whole table later.

## Hidden HTML table / diagram

An HTML block is created on the page, which should contain the desired diagrams. There is a division into 7 (week), 30 (month) and 365 (year) days:

```
<div id="morris-week" class="morris-chart"></div>
<div id="morris-month" class="morris-chart"></div>
<div id="morris-year" class="morris-chart"></div>
```

The desired data is assigned as "[table id=xx]", which is written into another HTML block.

## Pass as JSON to morris.js

The HFCM plugin creates two entries, one for the header:

```
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/morris.js/0.4.3/morris.css">
<script src="//cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/morris.js/0.4.3/morris.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js"></script>
<style>
/* verstecke Tabelle */
 .tablepress {display:none}
</style>
```

A second entry for the footer:
 
```
<script> 
[Copy&paste the source code of tablecatcher.min.js here]
</script> 
```

Both HCFM entries are connected to the page.

If the page is now opened, the following happens:
1. TablePress returns the HTML table, but it remains invisible.
2. tablecatcher.min.js reads this table and creates a JSON object from it.
3. each row is analyzed and split into more JSON objects for week/month/year with the help of moment.js.
4. values like "average previous week" etc. are calculated.
5. the JSON objects are passed to morris.js (and the values to the overview table)

