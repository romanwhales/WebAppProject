$(function(){
	$(".signup").click(function(e){
		e.preventDefault();
		var pass1 = $('.password1').val();
		var username = $('.uname').val();
		var email = $('.mail').val();
		var pass2 = $('.password2').val();
		console.log('Password2 is ',pass2);
		if(pass1 !== pass2){
			$('#passwordfail').html("Passwords must match")
		}else{
			$.post('/signupp',{'username':username,'password':pass1,'email':email},function(data){
				$('#passwordsuccess').html(data);
				$(this).closest('form').find('input[type=text],input[type=pasword]').val("");
			})
		}
	})
})