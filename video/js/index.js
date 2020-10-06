
function translation (mission, color, color2, comment, comment2){
    $.ajax(
        {url: `${window.location.protocol}//${window.location.hostname}:8000/${mission}`,
        type: 'GET',
        crossDomain: true,
        success: function(result){
            if(result.status === "ok"){
                $(".marker").css("background-color", color);
                $(".text-status").text(comment);
            } else {
                $(".marker").css("background-color", color2);
                $(".text-status").text(comment2);

            }
            console.log(result);
        },
        error: function (jqXHR, exception) {
            $(".marker").css("background-color", color2);
            $(".text-status").text(comment2);
            console.log(jqXHR);
            console.log(exception);
    }
    });
  };

setInterval(translation, 3000, 'state1', 'green', 'red', 'plaing', 'not plaing')