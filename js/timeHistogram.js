
			function hist1(){
			var values = [
			8, 7, 0, 6, 12, 2, 2, 20, 23, 17, 17, 21, 20, 23, 22, 19, 19, 7, 21, 0, 19, 5, 23, 19, 11, 22, 1, 22, 12, 1, 0, 0, 0, 23, 2, 2, 23, 2, 22, 0, 17, 10, 22, 20, 14, 12, 21, 1, 22, 5, 17, 23, 7, 20, 1, 20, 19, 1, 20, 21, 16, 1, 0, 22, 18, 19, 23, 5, 17, 20, 18, 9, 8, 19, 14, 16, 23, 21, 23, 2, 10, 21, 18, 2, 19, 22, 22, 3, 23, 21, 5, 23, 22, 22, 12, 22, 21, 19, 19, 23, 20, 20, 20, 21, 1, 20, 20, 0, 21, 19, 22, 22, 20, 16, 2, 22, 22, 20, 19, 1, 1, 18, 18, 23, 3, 23, 0, 17, 17, 20, 8, 21, 21, 21, 21, 20, 22, 21, 1, 10, 4, 20, 17, 2, 21, 1, 0, 16, 19, 22, 1, 13, 23, 2, 17, 23, 14, 22, 22, 14, 22, 22, 14, 18, 17, 18, 18, 20, 22, 16, 1, 23, 23, 23, 18, 21, 21, 22, 21, 21, 18, 21, 21, 1, 3, 21, 17, 17, 21, 2, 20, 3, 23, 4, 23, 3, 21, 16, 21, 23, 23, 23, 15, 14, 1, 2, 13, 1, 2, 23, 23, 14, 0, 23, 18, 12, 15, 13, 5, 19, 6, 12, 1, 0, 22, 23, 20, 7, 18, 2, 19, 2, 15, 13, 21, 15, 2, 21, 19, 1, 0, 22, 2]

			// A formatter for counts.
			var formatCount = d3.format(",.1f");

			var margin = {top: 10, right: 20, bottom: 30, left: 20},
				width = $('#timeHistogram').width() - margin.left - margin.right,
				height = 400 - margin.top - margin.bottom;

			var x = d3.scale.linear()
				.domain([0, 24])
				.range([0, width]);

			var data = d3.layout.histogram()
				.bins(x.ticks(24))
				//(hour_count);
                (values);
			
			var color = d3.scale.ordinal()
				.range(colorbrewer.BrBG[10]);
			
			var y = d3.scale.linear()
				.domain([0, d3.max(data, function(d) { return d.y; })])
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom")
				.ticks(25)
				.tickFormat(function(d, i){
   				 if (d==0) {return "12 am";}
   				 else if (d>0 & d<12) {return d + " am";}
   				 else if (d==12) {return "12 pm";}
   				 else if (d>12 & d<24) {return d-12 + " pm";}
   				 else {return "12 am"};
   				 });

			var svg = d3.select("#timeHistogram").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  	.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var bar = svg.selectAll(".bar")
				.data(data)
			  .enter().append("g")
				.attr("class", "bar")
				.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

			bar.append("rect")
				.attr("x", 1)
				.attr("width", x(data[0].dx) - 5)
				.attr("height", function(d) { return height - y(d.y); })

			bar.append("text")
				.attr("dy", ".75em")
				.attr("y", 4)
				.attr("x", x(data[0].dx) / 2)
				.attr("text-anchor", "middle")
				.style("font-size",10)
				.text(function(d) { return formatCount((d.y)/243*100) + "%"; });

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);
			}
			hist1();