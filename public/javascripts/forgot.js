$(function(){
	$('.canc').click(function(){
		var mail = $('.mail').val();
		if (mail === ""){
			$('#\\#myModal').modal('show');
			return false;
		}
		// alert("mail is ",mail);
	})
})