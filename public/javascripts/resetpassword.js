$(function(){
	$('.updatebtn').click(function(){
		var pass1 = $('.newp').val();
		var pass2 = $('.conp').val();
		if(pass1 !== pass2){
			console.log('Wrong password');
		}
	})
})