/* Magic Mirror
 * Node Helper: RubishCollection
 *
 * By upgrade_script
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const request = require('request');
const cheerio = require('cheerio');

module.exports = NodeHelper.create({

    start: function() {
      console.log("Starting node helper for: " + this.name);
   
    },
    
    // remove spaces in the collected date arrays
    formatDate: function(arr) {
		// loop each item in array
		arr.forEach(function (part , index) {
		// remove spaces
		arr[index] = part.trim();
		});
		//remove empty array contents
		arr = arr.filter(Boolean);
		return arr;
	},

    getBins: function(url) {
		// get HTML from web site
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
				//extract data from HTML
				var collectionDate = new Array();
				const $ = cheerio.load(body);
				// use id from web site to extract text and store in array
				collectionDate.push(["garden"].concat(this.formatDate($("#Garden").text().trim().split("\n"))));
				collectionDate.push(["rubbish"].concat(this.formatDate($("#Rubbish").text().trim().split("\n"))));
				collectionDate.push(["recycle"].concat(this.formatDate($("#Recycling").text().trim().split("\n"))));
				console.log(collectionDate);
                this.sendSocketNotification('BIN_RESULTS', collectionDate);
		
            }
        });
    },
    


    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_BINS') {
			console.log(payload);
            this.getBins(payload);
        }
    }
});
