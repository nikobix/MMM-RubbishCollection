# MMM-RubbishCollection
Magic Mirror module that skims local council website for bin collection times

![alt text](https://github.com/nikobix/MMM-RubbishCollection/blob/master/img/App_Shot.jpg)


Build details to follow - still bug fixing and updating.

Uses Nodehelper.js to obtain data from local council website. The website address is passed to the NodeHelper from the main JS. I use skimming but there are some councils that have APIs.
As long as the Nodehelper returns the data as an array in the below format the RubbishCollection module will display with flashing bin for today or next day with a click to stop flashing. 

			this.binTimes = [
			[ 'garden', 'Thursday 12 May 2020', 'Thursday 28 May 2020' ],
			[ 'rubbish', 'Tuesday 15 May 2020', 'Tuesday 02 June 2020' ],
			[ 'recycle', 'Tuesday 14 May 2020', 'Tuesday 16 May 2020','Tuesday 26 May 2020'  ]
						]; 

This is a double array ---- Array [collection type] [type,dates]

Example config

	{ 	module: "RubishCollection",
			position: "center",
      header: "Bin Collection",
      config: {
      weeks : 1,      // number of weeks to show date per type of collection 
      test: false,    //set for test data
      }
	},
        
Update interval is set to every 6 hours  6x60x60x1000 to reduce the number of times I skim the council website (i did get permission from the local authority to skim)

