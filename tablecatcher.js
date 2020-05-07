/****************************
 * Load data from Html Table
 * Filter by week and month
 * Calculate some values
 * Put to morris.js Ver. 4.0
 *
 * Customized for
 * http://via-energy.de/preisentwicklung-diesel
 * http://via-energy.de/preisentwicklung-heizoel
 * by https://www.werk.com and https://www.amalesh.de
 *
 * Ver. 1.1
 * kempf@werk4.net
 ***************************/

jQuery(document).ready(function () {

    const formatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    });

    const trend_up = 'up';
    const trend_down = 'down';
    const trend_equal = 'equal';

    var data_month = [];
    var data_week = [];

    var sum_preweek_a = 0;
    var sum_preweek_b = 0;
    var cnt_preweek = 0;
    var price_preday_a = 0;
    var price_preday_b = 0;
    var price_today_a = 0;
    var price_today_b = 0;

    const df = 'YYYYMMDD';
    const today = moment().format(df);
    var tabledate = today;

    const days7ago = moment().subtract('days', 7).format(df);
    const days14ago = moment().subtract('days', 14).format(df);
    const days30ago = moment().subtract('days', 30).format(df);
    const days365ago = moment().subtract('days', 365).format(df);

    // Get json
    var data_year = jQuery('table.tablepress tbody tr').map(function () {
        var cols = jQuery(this).find('td');
        var dtm = cols[0].innerHTML;
        var prs = parseFloat(cols[1].innerHTML.replace(",", ".")) + '' * 1;

        var dtm_check = moment(date2iso(dtm, "YYYY-MM-DD")).format(df);

        prs = prs ? prs : null;

        if (dtm_check >= days365ago && dtm_check <= today) {
            // if 3 columns
            if (cols[2]) {
                var col2 = parseFloat(cols[2].innerHTML.replace(",", ".")) + '' * 1;
                col2 = col2 ? col2 : null;
                return {
                    Datum: dtm,
                    A: prs,
                    B: col2
                };
            } else {
                return {
                    Datum: dtm,
                    A: prs,
                };
            }
        }
    }).get();

    var i = 0;
    var all_price_a = [];
    var all_price_b = [];
    // Parse json
    data_year.forEach(function (item) {

        tabledate = moment(date2iso(item.Datum, "YYYY-MM-DD")).format(df);

        // last week und current prices
        if (tabledate >= days14ago) {
            if (item.A) {

                all_price_a[i] = item.A;

                price_today_a = item.A;
                price_preday_a = all_price_a[i - 1];

                if (!price_preday_a) {
                    var n;
                    for (n = 2; n < 6; n++) {
                        if (all_price_a[i - n]) {
                            price_preday_a = all_price_a[i - n];
                            break;
                        }

                    }
                }

                // add price
                if (tabledate <= days7ago) {
                    sum_preweek_a += item.A;
                    cnt_preweek++;
                }
            }

            if (item.B) {

                all_price_b[i] = item.B;

                price_today_b = item.B;
                price_preday_b = all_price_b[i - 1];

                if (!price_preday_b) {
                    for (n = 2; n < 6; n++) {
                        if (all_price_b[i - n]) {
                            price_preday_b = all_price_b[i - n];
                            break;
                        }

                    }
                }

                if (tabledate <= days7ago) {
                    sum_preweek_b += item.B;
                }
            }
            
            i++;
        }

        // last 30 days
        if (tabledate >= days30ago && tabledate <= today) {
            data_month.push(item);
        }
        // last 7 days
        if (tabledate >= days7ago && tabledate <= today) {
            data_week.push(item);
        }

    });

    // trend
    var trend_a = (price_today_a - price_preday_a) > 0 ? trend_up : trend_down;
    if (price_today_a - price_preday_a === 0) {
        trend_a = trend_equal
    }

    // Average Week before
    var avg_preweek_a = sum_preweek_a / cnt_preweek;

    if (sum_preweek_b) {

        // Average
        var avg_preweek_b = sum_preweek_b / cnt_preweek;

        // Trend
        var trend_b = (price_today_b - price_preday_b) > 0 ? trend_up : trend_down;

        if (price_today_b - price_preday_b === 0) {
            trend_b = trend_equal
        }

        // Fill overview
        drawOverview('avg_preweek_b', formatter.format(avg_preweek_b));
        drawOverview('price_preday_b', formatter.format(price_preday_b));
        drawOverview('price_today_b', formatter.format(price_today_b));

        addTrend('trend_b', trend_b);

    }

    // Fill overview
    drawOverview('avg_preweek_a', formatter.format(avg_preweek_a));
    drawOverview('price_preday_a', formatter.format(price_preday_a));
    drawOverview('price_today_a', formatter.format(price_today_a));

    addTrend('trend_a', trend_a);

    // Give to morris
    drawMorris('year', data_year);
    drawMorris('week', data_week);
    drawMorris('month', data_month);


    // The functions
    // *************
    function date2iso(str) {
        var darr = str.split(".");
        return darr[2] + '-' + darr[1] + '-' + darr[0]
    }

    function drawOverview(element, data) {
        jQuery('#' + element).html(data)
    }

    function addTrend(element, css) {
        var trendline = 'morris-trend morris-trend-' + css;
        jQuery('#' + element).addClass(trendline)
    }

    function drawMorris(element, data) {
        new Morris.Line({
            element: 'morris-' + element,
            data: data,
            xkey: 'Datum',
            ykeys: ['A', 'B'],
            labels: ['A'],
            lineColors: ['#007bc3', '#636c30'],
            gridIntegers: true,
            ymin: 'auto',
            ymax: 'auto',
            xLabelangle: 60,
            xLabels: 'month',
            yLabelFormat: function (y) {
                return formatter.format(y) + ' / 100l';
            },
            hidehover: 'auto',
            hoverCallback: function (index, options) {
                var data = options.data[index];
                var fill = '';
                if (data.A) {
                    var pr2 = formatter.format(data.A);
                    fill = '<div class="strong">' + data.Datum + '<br>' + pr2 + ' / 100l </div>';
                }
                if (data.B) {
                    var pr3 = formatter.format(data.B);
                    fill = '<div class="strong">' + data.Datum + '<br>Standard: ' + pr2 + ' / 100l<br>Premium: ' + pr3 + ' / 100l </div>';
                }
                jQuery(".morris-hover").html(fill);
            },
            pointSize: 3,
            parseTime: false,
            // Not available in Morris Ver. 0.5, but needed to fill the empty rows with a line
            continuousLine: true
        });


    }

});

