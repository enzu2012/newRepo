function findWrongRules(rules) {
    var rules = rules.split("\n");
    var wrongInfo = "";
    var wrongStatus = 0;
    var reg;
    var matchInfo;
    var strWaitCheck;
    var notRepeatObj;

    /*非法字符组合对象数组*/
    var illegalStringObj = [
        {
            illegalString: "|+", wrongMsg: "非法字符组合《|+》"
        }, {
            illegalString: "+=", wrongMsg: "非法字符组合《+=》"
        }, {
            illegalString: ",=", wrongMsg: "非法字符组合《,=》"
        }, {
            illegalString: "+++", wrongMsg: "非法字符组合《+++》"
        }, {
            illegalString: "=%", wrongMsg: "非法字符组合《=%》"
        }, {
            illegalString: "=*", wrongMsg: "非法字符组合《=*》"
        }, {
            illegalString: "][[", wrongMsg: "非法字符组合《][[》"
        }, {
            illegalString: "[[", wrongMsg: "非法字符组合《[[》"
        }, {
            illegalString: "]]", wrongMsg: "非法字符组合《]]》"
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
            illegalString: "..", wrongMsg: "非法字符组合《..》"
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
        }, {
            illegalString: "]NA]", wrongMsg: "非法字符组合《]NA]》"
        }, {
            illegalString: "[NA[", wrongMsg: "非法字符组合《[NA[》"
        }, {
            illegalString: "rule-rule-", wrongMsg: "规则名错误？《rule-rule-》"
        }, {
            illegalString: "~|", wrongMsg: "非法字符组合《~|》"
        }, {
            illegalString: "++*", wrongMsg: "非法字符组合《++*》"
        }, {
            illegalString: "++%", wrongMsg: "非法字符组合《++%》"
        }, {
            illegalString: "==", wrongMsg: "非法字符组合《==》"
        }, {
            illegalString: " ", wrongMsg: "非法字符《空格》"
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
        }, {
            regString: "[=\\+]+[^=,#\\+0-9]+[0-9]+[=\\+-]+[^=,#~-]+", wrongMsg: "两限定间无《,》", matchInfoShow: 1
        }, {
            regString: "[0-9][\\+\\=][^0-9\\+-=,#~]+\\+", wrongMsg: "限定缺少《=或+》", matchInfoShow: 1
        }, {
            regString: "#\\d\\]", wrongMsg: "格式错误", matchInfoShow: 1
        }, {
            regString: "\\[(\\d{1,2}|\\D{2})[^\\]]", wrongMsg: "缺失《]》", matchInfoShow: 1
        }, {
            regString: "[^\\[](\\d{1,2}|\\D{2})[\\]]", wrongMsg: "缺失《[》", matchInfoShow: 1
        }, {
            regString: "(^QA[^:])|(^Q[:：])|(^A[:：])", wrongMsg: "QA:错误", matchInfoShow: 1
        }, {
            regString: "[~\\.][^\\|#=+~.]+,rule(-[\\w]+)+,[^\\.]+\\.", wrongMsg: "三元组缺少《#》", matchInfoShow: 1
        }, {
            regString: "#[^#\\.\\-,\\n]+rule(-[\\w]+)+",
            wrongMsg: "三元组缺少《,》",
            matchInfoShow: 1
        }, {
            regString: "rule(-[\\w]+)+[^,][\\[\\]\\.]+",
            wrongMsg: "三元组缺少《,》",
            matchInfoShow: 1
        }, {
            regString: "([=\\+]{1,2}[^\\+\\-,#~=]+)+\\-[^\\+\\-,#~=]*", wrongMsg: "限定同时存在《+》和《-》", matchInfoShow: 1
        }];

    /*必要符号对象数组*/
    var essentialStringObj = [
        {
            essentialString: "~", wrongMsg: "缺少《~》符号"
        }, {
            essentialString: "#", wrongMsg: "缺少《#》符号"
        }, {
            essentialString: ".", wrongMsg: "缺少符号《.》"
        }, {
            essentialString: "rule-", wrongMsg: "缺少规则名"
        }];

    /*特定位置不可重复正则对象数组*/
    var somewhereNotRepeatObj = [
        {
            repeatReg: "\\[1\\]", wrongMsg: "变量序号重复", splitString: "|", matchInfoShow: 1, waitCheckIndex: 0
        }, {
            repeatReg: "\\[2\\]", wrongMsg: "变量序号重复", splitString: "|", matchInfoShow: 1, waitCheckIndex: 0
        }, {
            repeatReg: "\\[3\\]", wrongMsg: "变量序号重复", splitString: "|", matchInfoShow: 1, waitCheckIndex: 0
        }, {
            repeatReg: "\\[4\\]", wrongMsg: "变量序号重复", splitString: "|", matchInfoShow: 1, waitCheckIndex: 0
        }, {
            repeatReg: "\\[5\\]", wrongMsg: "变量序号重复", splitString: "|", matchInfoShow: 1, waitCheckIndex: 0
        }, {
            repeatReg: "\\[6\\]", wrongMsg: "变量序号重复", splitString: "|", matchInfoShow: 1, waitCheckIndex: 0
        }, {
            repeatReg: "\\[7\\]", wrongMsg: "变量序号重复", splitString: "|", matchInfoShow: 1, waitCheckIndex: 0
        }, {
            repeatReg: "\\[8\\]", wrongMsg: "变量序号重复", splitString: "|", matchInfoShow: 1, waitCheckIndex: 0
        }, {
            repeatReg: "\\[9\\]", wrongMsg: "变量序号重复", splitString: "|", matchInfoShow: 1, waitCheckIndex: 0
        }];


    for (var i = 0; i < rules.length; i++) {

        if (rules[i] && !rules[i].match(/^------/) && !rules[i].match(/^#rules$/)) {

            /*必要符号检测*/
            for (var e = 0; e < essentialStringObj.length; e++) {
                if (rules[i].indexOf(essentialStringObj[e].essentialString) === -1) {
                    if (wrongStatus === 0) {
                        wrongInfo += rules[i] + "\n【" + essentialStringObj[e].wrongMsg + "】";
                        wrongStatus = 1;
                    } else {
                        wrongInfo += "\n【" + essentialStringObj[e].wrongMsg + "】";
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
                            if (mi > 0) {
                                wrongInfo += "__"
                            }
                            wrongInfo += "<<" + matchInfo[mi] + ">>";
                        }
                    }
                    wrongInfo += "】";
                }
            }

            /*特定位置重复项检测*/
            for (var sn = 0; sn < somewhereNotRepeatObj.length; sn++) {
                notRepeatObj = somewhereNotRepeatObj[sn];
                if (rules[i].indexOf(notRepeatObj.splitString) !== -1) {
                    strWaitCheck = rules[i].split(notRepeatObj.splitString)[notRepeatObj.waitCheckIndex];
                } else {
                    continue;
                }
                reg = RegExp(notRepeatObj.repeatReg, "g");
                matchInfo = strWaitCheck.match(reg);
                if (matchInfo) {
                    if (matchInfo.length > 1) {
                        if (wrongStatus === 0) {
                            wrongInfo += rules[i] + "\n【问题：" + notRepeatObj.wrongMsg;
                            wrongStatus = 1;
                        } else {
                            wrongInfo += "\n【问题：" + notRepeatObj.wrongMsg;
                        }
                        if (notRepeatObj.matchInfoShow === 1) {
                            wrongInfo += "---错误信息：";
                            for (var mi = 0; mi < matchInfo.length; mi++) {
                                if (mi > 0) {
                                    wrongInfo += "__"
                                }
                                wrongInfo += " <<" + matchInfo[mi] + ">>";
                            }
                        }
                        wrongInfo += "】";
                    }
                } else {
                    continue
                }
            }


            if (wrongStatus === 1) {
                wrongInfo += "\n\n";
            }
            wrongStatus = 0;
        }
    }
    if (wrongInfo.length < 7) wrongInfo = "未查找到错误";
    return wrongInfo;
}


//加载完毕执行
$(function () {
    $("input#btn-find-wrong-rules").on("click", function () {
        var wrongRuleInfo = findWrongRules($("textarea#rules").val());
        $("textarea#wrong-rules").val(wrongRuleInfo);
    })
});