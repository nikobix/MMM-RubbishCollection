/* global Module */

/* Magic Mirror
 * Module: RubishCollection
 *
 * By upgrade_script
 * MIT Licensed.
 */
 
 /*
  * things to add
  * 1/ on click to stop flasing bin
  * 2/ improve layout of date table
  * 3/ 
  * */

Module.register("RubishCollection", {
	
		// Default module config.
	defaults: {
		updateInterval: 6 * 60 * 60 * 1000, //refresh every 6 hour
		retryDelay: 5000,
		weeks: 1,
		test: false
	},
	
	getStyles: function () {
		return [
			"RubishCollection.css",
		];
	},
	
	// Define required scripts.
	getScripts: function() {
		return [];
	},
	
	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;
		this.monthArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
		var tomorrowsDate = new Date();
		this.binSize = "20px";
		tomorrowsDate.setDate(tomorrowsDate.getDate()+1);
		console.log(tomorrowsDate);
		this.binTimes = new Array(); 
		this.recyclePNG = this.file('img/green.png');
		this.rubbishPNG = this.file('img/grey.png');
		this.gardenPNG = this.file('img/brown.png');
		this.url = 'https://el.hastings.gov.uk/MyArea/MyAreaAsyncNew.aspx?uprn=100060040595&postcode=TN34 1UA&c={xref_council_tax}&b={xref_benefits}&ucrn=75316296'
		//Flag for check if module is loaded
		this.loaded = false;
		//set binTimes to null;
		this.binTimes = null;
		
		if(this.config.test){
			// added for testing test flag set too true ********
			this.binTimes = [
			[ 'garden', 'Thursday 12 May 2020', 'Thursday 28 May 2020' ],
			[ 'rubbish', 'Tuesday 15 May 2020', 'Tuesday 02 June 2020' ],
			[ 'recycle', 'Tuesday 14 May 2020', 'Tuesday 16 May 2020','Tuesday 26 May 2020'  ]
						]; 
			this.formateDate(this.binTimes);
			this.binTimes = this.putDatesInOrder(this.binTimes);
		} else {
			this.requestData(); //start live HTTP request
			}
				
		setInterval(function() {
			console.log("*******************Refresh Rubbish");
			self.requestData();
			self.updateDom();
		}, this.config.updateInterval);

	},
		// Define required scripts.
	getScripts: function () {
		return ["moment.js","cheerio.js","request-promise"];
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	requestData: function() {
		//send request to node helper to get data from node helper 
		//console.log("Getting Bin Data");
		       this.sendSocketNotification('GET_BINS', this.url); 
	},
	
	socketNotificationReceived: function(notification,payload) {
		// recieve data from website using node helper
		if (notification ==="BIN_RESULTS") {
			//console.log(payload);
			this.binTimes = payload;			
			this.formateDate(this.binTimes);
			this.binTimes = this.putDatesInOrder(this.binTimes);
			//console.log("put dates in order");
			this.updateDom();
		};
	},
	
	// create HTML DOM 

	getDom: function() {
		if(this.binTimes != null){
			var wrapper = document.createElement("div");
			wrapper.className = "bintimes";
			wrapper.appendChild(this.DOMLayersMTO(this.binTimes));
			
			return wrapper;
		}
	},
	// create DOM table elements from binTimes array for more than one week
	DOMLayersMTO: function(date){
		var header = false;
		var headerFlag = false;
		var binColor;
		var cD; //collection Date
		
// create table wrapper
		var tbl = document.createElement("table");
		tbl.className = "bin_table";

// load icons

		var tD = this.tomorrowsDate();
		var binImgs = this.getBinImg();
		var brown = binImgs[0];
		var green = binImgs[1];
		var grey = binImgs[2];
		var firstDate=false;
		var textFlag = false;
		var weeks = this.config.weeks;
		
		//loop all collection types
		for(index = 0 ; index<date.length ; index++)
			{	
		// loop all times within collection type
			weeks >= date[index].lenght ? weeks = date[index].length : weeks = weeks;
			console.log(weeks);
			for(item = 0 ; item<=weeks ;item++)//date[index].length; item++) 
				{ 
		// put array value into cellItem
				var cellItem = date[index][item];
		//set the cell spread for image depenent on number of dates
				var spreadSize = weeks;
		// put try catch here incase the html data changes ******
		// check if item in array is text or date
				switch (cellItem) {
					case 'rubbish':
						binColor = grey;
						headerFlag = true;
						cD = date[index][item+1].toDateString();
					break;
					case 'garden':
						binColor = brown;
						headerFlag = true;
						cD = date[index][item+1].toDateString();
					break;
					case 'recycle':
						binColor = green
						headerFlag = true;
						cD = date[index][item+1].toDateString();
					break;
					default: 
						headerFlag = false;
						
					}
				//binColor.className = "bin";
				if(headerFlag){
					var row = document.createElement('tr');
					row.className = "time_row";
					var colSpread = document.createElement('th');
					var toDay = new Date().toDateString();
					// if collecion date for tomorrow
					if(tD === cD) {
						textFlag=true;
						text = this.flashBin("Tomorrow" , colSpread , binColor, row);
						binColor.className = "flashBinImg";
					 } else 
					// if collecion date for today
					 if(toDay == cD) {
						textFlag=true;
						text = this.flashBin("Today" , colSpread , binColor, row);
						binColor.className = "flashBinImg";
					 } else	{
						 binColor.className = "bin";
						 }
					colSpread.setAttribute('rowSpan', weeks); 
					
					colSpread.appendChild(binColor);
					row.appendChild(colSpread);
					firstDate=true;
				}else if(firstDate && !headerFlag) {
					//console.log(cellItem)
					var col = document.createElement('td');
					col.className	= `text`;
					if(textFlag) {
						col.textContent = text;
						col.className = 'flashbintext';
						}
					else {
						col.innerHTML = cellItem.toDateString();
						col.className = `text`;
					}
					row.appendChild(col);
					tbl.appendChild(row);
					firstDate = false;
					headerFlag = false;
					textFlag = false;
				}else{
					var row = document.createElement('tr');
					row.className = "time_row";
					var col = document.createElement('td');
					col.className	= `text`;
					console.log(cellItem);
					cellItem!=null ? col.innerHTML = cellItem.toDateString() : col.innerHTML = "";
					row.appendChild(col);
					tbl.appendChild(row);
				}
			}
		}
	//console.log(tbl);
	return tbl;
	},

	// function to add flashing bin and text with on click to stop flashing. 
	flashBin: function(textType , colSpread, binColor, row){
		row.className = 'flashbin time_row';
		//binColor.style = `width = 10px`;
		row.addEventListener("click", () => row.className = 'noflashbin');
		textFlag=true;
		return textType;
	},
	
	getScripts: function() {
		return [];
	},
	//function to return tomorrows date
	tomorrowsDate: function(){
		var tomorrowsDate = new Date();
		tomorrowsDate.setDate(tomorrowsDate.getDate()+1);
		var tD = tomorrowsDate.toDateString();
		return tD;
	},
	//function to load images and return an array of images
	getBinImg: function(){
		var brown = document.createElement('img');
		brown.src=this.gardenPNG;
		//brown.style =`width: ${this.binSize}`;
		
		var green = document.createElement('img');
		green.src=this.recyclePNG;
		//green.style =`width: ${this.binSize}`;
				
		var grey = document.createElement('img');
		grey.src=this.rubbishPNG;
		//8grey.style =`width: ${this.binSize}`;

		var firstDate=false;
		
		return [brown , green , grey];
},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

// function to format the date array and return formatted array
	formateDate: function(dateArray) {
						//loop all collection types
		for(index = 0 ; index<dateArray.length ; index++)
			{	
						// loop all times within collection type
			for(item = 0 ; item<dateArray[index].length; item++) 
				{ 
						//check if item in array is text or date
				if(!(dateArray[index][item] === "rubbish" || dateArray[index][item] === "garden" || dateArray[index][item] === "recycle")) 
					{
						// split date text 
					var itemSplit = dateArray[index][item].split(" ");
						// create new date object using date text parts and store in dateArray
					dateArray[index][item] = new Date(itemSplit[3],this.monthArray.indexOf(itemSplit[2]),itemSplit[1]);
				}
			}
		}
	//console.log (dateArray);
	
	},
		
		
	putDatesInOrder: function(dates) {
		var len = dates.length, i, j, temp;
		for (i=0; i < len; i++)
		{
			for (j=0; j < len-1; j++)
			{
				if (dates[j][1] > dates[j+1][1])
				{
					temp=dates[j+1];
					dates[j+1]= dates[j];
					dates[j] = temp;				
				}
			}
		}
		return dates;
	},

});
