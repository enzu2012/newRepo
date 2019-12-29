function findWrongRules(rules) {
    var rules = rules.split("\n");
    var wrongInfo = "";
    var wrongStatus = 0;
    var reg;
    var matchInfo;

    /*非法字符组合对象数组*/
    var illegalStringObj = [
        {
            illegalString: "|+", wrongMsg: "非法字符组合《|+》"
        }, {
            illegalString: "+==", wrongMsg: "非法字符组合《+=》"
        }, {
            illegalString: ",==", wrongMsg: "非法字符组合《,=》"
        }, {
            illegalString: "+++", wrongMsg: "非法字符组合《+++》"
        }, {
            illegalString: "《=%", wrongMsg: "非法字符组合《=%》"
        }, {
            illegalString: "=*", wrongMsg: "非法字符组合《=*》"
        }, {
            illegalString: "][[", wrongMsg: "非法字符组合《][[》"
        }, {
            illegalString: "[[", wrongMsg: "非法字符组合《[[》"
        }, {
            illegalString: "][", wrongMsg: "非法字符组合《][》"
        }, {
            illegalString: ",=", wrongMsg: "非法字符组合《,=》"
        }, {
            illegalString: "|+", wrongMsg: "非法字符组合《|+》"
        }, {
            illegalString: "|=", wrongMsg: "非法字符组合《|=》"
        }, {
            illegalString: "##", wrongMsg: "非法字符组合《##》"
        }, {
            illegalString: ",,", wrongMsg: "非法字符组合《,,》"
        }, {
            illegalString: "《..", wrongMsg: "非法字符组合《..》"
        }, {
            illegalString: ".,", wrongMsg: "非法字符组合《.,》"
        }, {
            illegalString: ",.", wrongMsg: "非法字符组合《,.》"
        }, {
            illegalString: "%%", wrongMsg: "非法字符组合《%%》"
        }, {
            illegalString: "**", wrongMsg: "非法字符组合《**》"
        }, {
            illegalString: "=+,", wrongMsg: "非法字符组合《=+,》"
        }];

    /*正则对象数组*/
    var checkRegExpObj = [
        {
            regString: "~[^~]*~", wrongMsg: "存在2个《~》符号", matchInfoShow: 1
        }, {
            regString: "\\|[^\\|]*\\|", wrongMsg: "存在2个《|》符号", matchInfoShow: 1
        }, {
            regString: "\\[(?!NA)[^0-9\\]]*\\]", wrongMsg: "[]之间不是NA或者数字", matchInfoShow: 1
        }, {
            regString: "[^\\.\\n]$", wrongMsg: "rule结尾没有《.》", matchInfoShow: 0
        }];


    /*必要符号对象数组*/
    var essentialStringObject = [
        {
            essentialString: "~", wrongMsg: "缺少《~》符号了"
        }, {
            essentialString: "#", wrongMsg: "缺少《#》符号"
        }, {
            essentialString: ".", wrongMsg: "缺少符号《.》"
        }, {
            essentialString: "rule-", wrongMsg: "缺少规则名"
        }];


    for (var i = 0; i < rules.length; i++) {

        if (rules[i] && !rules[i].match(/^------/)&&!rules[i].match(/^#rules$/)) {

            /*必要符号检测*/
            for (var e = 0; e < essentialStringObject.length; e++) {
                if (rules[i].indexOf(essentialStringObject[e].essentialString) === -1) {
                    if (wrongStatus === 0) {
                        wrongInfo += rules[i] + "\n【" + essentialStringObject[e].wrongMsg + "】";
                        wrongStatus = 1;
                    } else {
                        wrongInfo += "\n【" + essentialStringObject[e].wrongMsg + "】";
                    }
                }
            }

            /*非法符号检测*/
            for (var il = 0; il < illegalStringObj.length; il++) {
                if (rules[i].indexOf(illegalStringObj[il].illegalString) !== -1) {
                    if (wrongStatus === 0) {
                        wrongInfo += rules[i] + "\n【" + illegalStringObj[il].wrongMsg + "】";
                        wrongStatus = 1;
                    } else {
                        wrongInfo += "\n【" + illegalStringObj[il].wrongMsg + "】";
                    }
                }
            }

            /*正则检测逻辑*/
            for (var c = 0; c < checkRegExpObj.length; c++) {
                reg = RegExp(checkRegExpObj[c].regString, "g");
                matchInfo = rules[i].match(reg);

                /*if (c >= 0) {
                    alert("正则表达式：" + reg + "\n\n" +
                        "匹配句子：" + rules[i] + "\n\n" +
                        "匹配个数：" + ((rules[i].match(reg)) ? rules[i].match(reg).length : 0) + "\n\n" +
                        "匹配第一项:" + ((rules[i].match(reg)) ? rules[i].match(reg)[0] : "未匹配"))
                }*/

                if (!matchInfo) {
                    continue;
                } else {
                    if (wrongStatus === 0) {
                        wrongInfo += rules[i] + "\n【问题：" + checkRegExpObj[c].wrongMsg;
                        wrongStatus = 1;
                    } else {
                        wrongInfo += "\n【问题：" + checkRegExpObj[c].wrongMsg;
                    }
                    if (checkRegExpObj[c].matchInfoShow === 1) {
                        wrongInfo += "---错误信息：";
                        for (var mi = 0; mi < matchInfo.length; mi++) {
                            wrongInfo += matchInfo[mi] + "-----";
                        }
                    }
                    wrongInfo += "】";
                }
            }

            if (wrongStatus === 1) {
                wrongInfo += "\n\n";
            }
            wrongStatus = 0;
        }
    }
    return wrongInfo;
}


//加载完毕执行
$(function () {
    $("input#btn-find-wrong-rules").on("click", function () {
        var wrongRuleInfo = findWrongRules($("textarea#rules").val());
        $("textarea#wrong-rules").val(wrongRuleInfo);
    })
});