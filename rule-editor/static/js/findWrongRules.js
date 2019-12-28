
function findWrongRules(rules){
    var rules = rules.split("\n");
    var wrongInfo="";
    var wrongStatus=0;
    var illegalStringObj=[
        {
            illegalString:"|+",wrongMsg:"非法字符组合《|+》"
        },{
            illegalString:"+==",wrongMsg:"非法字符组合《+=》"
        },{
            illegalString:",==",wrongMsg:"非法字符组合《,=》"
        },{
            illegalString:"+++",wrongMsg:"非法字符组合《+++》"
        },{
            illegalString:"《=%",wrongMsg:"非法字符组合《=%》"
        },{
            illegalString:"=*",wrongMsg:"非法字符组合《=*》"
        },{
            illegalString:"][[",wrongMsg:"非法字符组合《][[》"
        },{
            illegalString:"[[",wrongMsg:"非法字符组合《[[》"
        },{
            illegalString:"][",wrongMsg:"非法字符组合《][》"
        },{
            illegalString:",=",wrongMsg:"非法字符组合《,=》"
        },{
            illegalString:"|+",wrongMsg:"非法字符组合《|+》"
        },{
            illegalString:"|=",wrongMsg:"非法字符组合《|=》"
        },{
            illegalString:"##",wrongMsg:"非法字符组合《##》"
        },{
            illegalString:",,",wrongMsg:"非法字符组合《,,》"
        },{
            illegalString:"《..",wrongMsg:"非法字符组合《..》"
        },{
            illegalString:".,",wrongMsg:"非法字符组合《.,》"
        },{
            illegalString:",.",wrongMsg:"非法字符组合《,.》"
        },{
            illegalString:"[N]",wrongMsg:"非法字符组合《[N]》"
        },{
            illegalString:"%%",wrongMsg:"非法字符组合《%%》"
        },{
            illegalString:"**",wrongMsg:"非法字符组合《**》"
        },{
            illegalString:"=+,",wrongMsg:"非法字符组合《=+,》"
        }];
    var checkRegExpObj= [
        {
            regString:"~[^~]*~",wrongMsg:"存在2个《~》符号"
        },{
            regString:"\|[^\|]*\|",wrongMsg:"存在2个《|》符号"
        },{
            regString:"\\.(?:(?:^#)|\\n)",wrongMsg:"符号《.》后面不是#或者rule结尾"
        }];
    for (var i = 0; i < rules.length; i++) {
        if (rules[i]) {
            for( var str=0;str<illegalStringObj.length;str++){
                if (rules[i].indexOf(illegalStringObj[str].illegalString)!==-1) {
                    if(wrongStatus===0){
                        wrongInfo+=rules[i]+"【"+illegalStringObj[str].wrongMsg+"】";
                        wrongStatus=1;
                    }else{
                        wrongInfo+="【"+illegalStringObj[str].wrongMsg+"】";
                    }
                }
            }
            /*此处增加正则检测逻辑*/
            if(wrongStatus===1) {
                wrongInfo += "\n\n";
            }
            wrongStatus=0;
        }
    }
    return wrongInfo;
}


//加载完毕执行
$(function () {
    $("input#btn-find-wrong-rules").on("click",function () {
        var wrongRuleInfo=findWrongRules($("textarea#rules").val());
        $("textarea#wrong-rules").val(wrongRuleInfo);
    })
});