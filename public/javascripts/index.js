$(function(){
	// $('input').typeahead({
	// 	name:'States',
	// 	local: ["Alabama","Alaska","West Virginia","Wisconsin","Wyoming"]
	// })
	$('input.typeahead').typeahead({
		name:'typeahead',
		remote:'http://localhost:3002/search',
		limit:10
	})
})