$(document).ready (function() {
	equi();
});

function equi() {
	var width = 1200,
    height = 600;

	var projection = d3.geo.equirectangular()
			.scale(191.25)
			.translate([width / 2, height / 2])
			.precision(.1);

	var path = d3.geo.path()
			.projection(projection);

	var graticule = d3.geo.graticule();

	var svg = d3.select("#map").append("svg")
			.attr("width", width)
			.attr("height", height);

	svg.append("path")
			.datum(graticule)
			.attr("class", "graticule")
				.attr("d", path);

	d3.json("/world-50m.json", function(world) {
		  svg.insert("path", ".graticule")
			  .datum(topojson.feature(world, world.objects.land))
			  .attr("class", "land")
			  .attr("d", path);

	  svg.insert("path", ".graticule")
			  .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
			  .attr("class", "boundary")
			  .attr("d", path);
	});


	d3.select(self.frameElement).style("height", height + "px");
	
	$("#search_submit").click(function() {
		svg.selectAll('circle').remove();
		svg.selectAll('line').remove();
		search_user(projection,svg);
	});
}

function search_user(projection,svg) {
	$.ajax({
		  type: "GET",
		  url: "/searches/users.json",
	  data: { username: $("#search_field").val() }
	}).done(function( json ) {
		load_map(json,projection,svg);
	});
}

function load_map(json,projection,svg) {
	var user_coords = projection([json.user.lng, json.user.lat]); 
	load_search_user(user_coords,projection,svg);
	load_users(user_coords,json.reciprocal,projection,svg,'white');
	load_users(user_coords,json.followers,projection,svg,'#024A68');
	load_users(user_coords,json.friends,projection,svg,'#228A4C');
	$(document).ajaxStop(function () {
		svg.selectAll("line").remove();
	});
}

function load_search_user(user_coords,projection,svg) {
	svg.append('circle')
	.attr('cx', user_coords[0])
	.attr('cy', user_coords[1])									.attr('r', 4)
	.style('fill', 'white');
}

function load_users(user_coords,users,projection,svg,color) {
	$.each(users, function(i, user) {
		$.ajax({
			  type: "GET",
			  url: "/searches/coordinates.json",
		  data: { location:user.location }
		}).done(function(json) {
			if (json.lat) {
				var coords = projection([json.lng, json.lat]);
				svg.append('circle')
				.attr('cx', coords[0])
				.attr('cy', coords[1])										.attr('r', 2)
				.style('fill', color);
				
				svg.append("line")
			 	.attr("x1", user_coords[0])
			 	.attr("y1", user_coords[1])
				.attr("x2", coords[0])
				.attr("y2", coords[1])
				.attr("stroke-width", 1)
				.attr("stroke", color);
			}
		});
	});
}


