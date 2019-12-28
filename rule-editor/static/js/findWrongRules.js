//加载完毕执行
function findWrongRules(rules){
    var rules = rules.split("\n");
    //alert(rules.length);
    for (var i = 0; i < rules.length; i++) {
        if (rules[i]) {
            if (rules[i].indexOf("|") !== -1) {
                rules[i] = rules[i].split("|")[0];
            } else if (rules[i].indexOf("~") !== -1) {
                rules[i] = rules[i].split("~")[0];
            } else {
                rules[i] = "";
            }
            rules[i] = rules[i].replace(/\[[^\]]*\]/gi, "");
            rules[i] = rules[i].replace(/QA:/gi, "");
            //alert(rules[i]);
        }
    }
    fileOfRules = "";
    for (var j = 0; j < rules.length; j++) {
        if (rules[j]) {
            fileOfRules += rules[j] + "\n";
        }
    }

    return wrongInfo;
}



$(function () {
    $("button#btn-find-wrong-rules").on("click",function () {
        var wrongInfo=findWrongRules($("textarea#rules").val());
        $("textarea#wrong-rules").val(wrongInfo);
    })
});