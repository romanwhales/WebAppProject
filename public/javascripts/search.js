$(function(){
	var form = $('form').attr('action');
	console.log('Form is ',form);
	var pos= form.lastIndexOf('/');
	var pos = pos +1;
	var idextracted = form.substring(pos);
	console.log('Id is ',idextracted);
	$('.ff').click(function(e){
		$.post('/follow/:id',{'id':idextracted},function(result){
			$('#response').html(result);
			return false;
		})
	})
})