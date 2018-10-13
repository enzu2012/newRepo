//获取测试结果并将待编辑语句生成表格显示
function getRulesInfo() {
    var text = $("#id_knowledge").val();
    var testResult = text.split("\n\n");
    var testInfo = "";
    var senNum = 1;
    var testSentence = "";
    for (var i = 0; i < testResult.length; i++) {
        //从测试结果中分离出测试语句
        if (testResult[i] != "" && testResult[i].length > 20) {
            testSentence = testResult[i].substring(testResult[i].indexOf(":  - ") + 5, testResult[i].indexOf("\n"));
            testInfo += "<tr>" +
                "<td>" + senNum + "</td>" +
                "<td id='" + i + "'>" + testSentence + "</td>" +
                "<td>" +
                "<button data-target='" + i + "' class='btn btn-success btn-xs btn-sen-select'>选中</button>&nbsp;&nbsp;&nbsp;" +
                "<button data-target='" + i + "' class='btn btn-primary btn-xs btn-rule-edit'>编辑</button>" +
                "<span class='btn btn-primary btn-xs btn-rule-edit' style='display: none'>" + testResult[i] + "</span>" +
                "</td>" +
                "</tr>";
            senNum++;
        }
    }
    $("div#rule-editor").find("table#test-info").html(testInfo);
    btnRuleEditOnClick();
}

//规则编辑页编辑按钮及选中按钮事件绑定函数
function btnRuleEditOnClick() {
    $("button.btn-rule-edit").each(function () {
        $(this).on("click", function () {
            $("div#rule-editor-tool").show();
            editRules(this);
        });
    });
    $("button.btn-sen-select").each(function () {
        $(this).on("click", function () {
            var target = $(this).attr("data-target");
            var td = document.getElementById(target);
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(td);
            selection.removeAllRanges();
            selection.addRange(range);
        })
    })
}
//查询规则数量
function checkRuleNum(){
    var ruleNums=$("textarea#save-space").val().match(/,rule-/gi);
    return (!ruleNums)?"0":ruleNums.length;
}
//刷新规则数目显示
function refreshRuleNum(){
    //显示现有rules
    $("em#rule-num-tag").text(checkRuleNum());
}

//生成编辑工具
function editRules(objBtnRuleEdit) {
    var target = $(objBtnRuleEdit).attr("data-target");
    //更新标记按钮目标
    $("button.btn-mark").attr("data-target", target);
    //更新上一句按钮目标
    $("button#btn-prev-sen").attr("data-target", target - 1);
    //更新下一句按钮目标
    $("button#btn-next-sen").attr("data-target", target - 1 + 2);
    //要编辑的语句
    var sentence = $(objBtnRuleEdit).parent().prev().text();
    //待编辑语句测试结果
    var infoSentence = $(objBtnRuleEdit).next().text();
    //alert(infoSentence);
    //测试结果显示位置
    var ruleInfo = $("div#rule-info");
    //编辑工具显示位置
    var ruleEditToolSpace = $("div#rule-edit-tool");
    //规则名工具显示位置
    var ruleNameToolSpace = $("div#rule-name-space");
    //关键词序号工具显示位置
    var keywordsNumToolSpace = $("div#keywords-num-space");
    //词语限定工具显示位置
    var restrictToolSpace = $("div#restrict-space");
    //清空编辑工具
    ruleEditToolSpace.html("");
    //清空规则名工具
    ruleNameToolSpace.html("");
    //清空关键词序号工具
    keywordsNumToolSpace.html("");
    //清空词语限定工具
    restrictToolSpace.html("");
    //根据测试结果获取的词组数组
    var words = [];
    //标点符号数组
    var symbol = ["，", "。", "、", "？", "！", ",", ".", "?", "!"];
    refreshRuleNum();
    //编辑工具按钮组字符串
    var ruleEditBtns = "<i class='btn btn-primary property fa fa-plus-square' style='margin-right: 10px'></i><i class='btn btn-danger ignore fa fa-minus-square' style='display: none;margin-right: 10px'></i>";
    //对匹配到的测试结果进行处理
    var infoHtml = "";
    var info = infoSentence.split("\n");
    infoHtml += "<textarea class='form-control' id='sentence-test-result' rows='3'></textarea>";
    for (var inf = 2; inf < info.length; inf++) {
        infoHtml += "<h5>" + info[inf] + "</h5>";
    }
    //显示匹配到的测试结果
    ruleInfo.show().html(infoHtml);
    $("textarea#sentence-test-result").val(info[0] + "\n" + info[1]);
    //提取括号包含的内容
    var senTestResult = info[1];
    var ruleWords = senTestResult.match(/\([^)]*\)/gi);
    //遍历括号内容数组，去掉括号并按逗号拆分词组 不重复的存入words数组
    for (var j = 0; j < ruleWords.length; j++) {
        ruleWords[j] = ruleWords[j].substring(1, ruleWords[j].length - 1);
        var word = ruleWords[j].split(",");
        for (var k = 0; k < word.length; k++) {
            word[k] = word[k].substring(0, word[k].indexOf('-'));
            if (word[k]) {
                if (words.indexOf(word[k]) === -1) words.push(word[k]);
            }
        }
    }
    //获取localstorage中的固定词组信息
    var dataFixedWords=window.localStorage.getItem("dataPreFixedWords");
    var fixedWords=dataFixedWords.split("\n");
    //alert(fixedWords);
    //将固定词组放入words数组
    for(var i=0;i<fixedWords.length;i++){
        words.push(fixedWords[i]);
    }
    words = words.sort().reverse();
    //alert(words);
    //按语句顺序匹配words中的关键词，生成rules编辑工具
    var loopNum = 0;
    //QA按钮
    ruleEditToolSpace.append("<span data-status='false'></span><button class='btn btn-primary btn-sm' id='qa'><b>QA:</b></button>&nbsp;&nbsp;&nbsp;");
    //匹配关键词 生成词组及词组控制按钮
    do {
        for (var w = 0; w < words.length; w++) {
            if (sentence.indexOf(words[w]) === 0) {
                sentence = sentence.substring(words[w].length, sentence.length);
                ruleEditToolSpace.append((symbol.indexOf(words[w]) !== -1) ? "<strong data-type='symbol'>" + words[w] + "</strong>" : "<strong data-type='ignore' class='h3'>" + words[w] + "</strong>" + ruleEditBtns);
            }
        }
        if (loopNum++ === 100) {
            var minIndex = sentence.length;
            var wordIndex = 0;
            for (var w1 = 0; w1 < words.length; w1++) {
                wordIndex = sentence.indexOf(words[w1]);
                if (wordIndex !== -1 && wordIndex < minIndex) {
                    minIndex = wordIndex;
                }
            }
            if (minIndex > 0) {
                //alert(sentence.substring(0, minIndex));
                ruleEditToolSpace.append("<strong data-type='ignore' class='h3'>" + sentence.substring(0, minIndex) + "</strong>" + ruleEditBtns);
                sentence = sentence.substring(minIndex, sentence.length);
                //alert(sentence);
                loopNum=0;
            }else{
                ruleEditToolSpace.html("");
                $("div#rule-editor-tool").show();
                $("textarea#rule").val("关键词匹配错误，请检查\"" + sentence.substring(0, 4) + "\"位置");
                return;
            }
        }
    } while (sentence.length !== 0);

    //生成规则名输入框及下拉框
    var ruleNameToolHtml = "";
    var nameOptionHtml = "";
    var presetRuleName = window.localStorage.getItem("dataPreRuleName");
    presetRuleName = presetRuleName.split("\n");
    if (presetRuleName[0].length > 2) {
        for (var num = 0; num < presetRuleName.length; num++) {
            nameOptionHtml += "<option value='" + presetRuleName[num] + "'>" + presetRuleName[num] + "</option>";
        }
    } else {
        nameOptionHtml += "<option value='none'>无预设规则名</option>";
    }
    ruleNameToolHtml += "<form class='form-inline' role='form' style=' margin: 0 0 5px 0 '>" +
        "<div class='form-group' style='margin-right: 5px'>" +
        "<label class='form-control' style='width: 120px;'>推理规则名：</label>" +
        "</div>" +
        "<div class='form-group' style='margin-right: 5px'>" +
        "<label class='sr-only' for='input-rule-name'>规则名文本</label>" +
        "<input type='text' class='form-control input-fixed' id='input-rule-name' value='" + (presetRuleName[0] ? presetRuleName[0] : "") + "' style='width: 130px;'>" +
        "</div>" +
        "<div class='form-group' style='margin-right: 5px'>" +
        "<select class='form-control select-fixed' id='preset-rule-name'>" +
        nameOptionHtml +
        "</select>" +
        "</div>" +
        "</form>";
    ruleNameToolSpace.html(ruleNameToolHtml);
    //生成关键词序号下拉框及输入框
    var optionHtml = "";
    for (var keywordNum = 1; keywordNum <= 6; keywordNum++) {
        optionHtml += "<option class='form-control' value='[" + keywordNum + "]'>[" + keywordNum + "]</option>";
    }
    var keywordsNumToolHtml = "<form class='form-inline' role='form' style=' margin: 0 0 5px 0 '>" +
        "<div class='form-group' style='margin-right: 5px'>" +
        "<label class='form-control' style='width: 120px;'>关键词-前：</label>" +
        "</div>" +
        "<div class='form-group' style='margin-right: 5px'>" +
        "<label class='sr-only' for='keyword-txt-ahead'>前关键词文本</label>" +
        "<input type='text' class='form-control input-fixed' id='keyword-txt-ahead' value='visitorname' style='width: 130px;'>" +
        "</div>" +
        "<div class='form-group' style='margin-right: 5px'>" +
        "<select class='form-control select-fixed' id='keyword-num-ahead'>" +
        "<option value='visitorname' selected>visitorname</option>" +
        optionHtml +
        "</select>" +
        "</div>" +
        "</form>" +
        "<form class='form-inline' role='form'>" +
        "<div class='form-group' style='margin-right: 5px'>" +
        "<label class='form-control' style='width: 120px;'>关键词-后：</label>" +
        "</div>" +
        "<div class='form-group' style='margin-right: 5px'>" +
        "<label class='sr-only' for='keyword-txt-behind'>后关键词文本</label>" +
        "<input type='text' class='form-control input-fixed' id='keyword-txt-behind' value='[1]' style='width: 130px;'>" +
        "</div>" +
        "<div class='form-group' style='margin-right: 5px'>" +
        "<select class='form-control select-fixed' id='keyword-num-behind'>" +
        optionHtml +
        "</select>" +
        "</div>" +
        "</form>";
    keywordsNumToolSpace.html(keywordsNumToolHtml);
    ruleEditToolSpace.show();
    bandForRuleEditBtns();
    createRule();
    return;
}

//为编辑工具按钮绑定事件
function bandForRuleEditBtns() {
    //关键词后按钮事件绑定
    $("i.property").each(function () {
        $(this).on("click", function () {
            makeWordProperty(this);
        })
    });
    $("i.ignore").each(function () {
        $(this).on("click", function () {
            makeWordIgnore(this);
        });
    });
    //QA按钮事件绑定
    $("button#qa").on("click", function () {
        var spanTag = $(this).prev("span");
        spanTag.attr("data-status", (spanTag.attr("data-status") === "false") ? "true" : "false");
        //alert(spanTag.attr("data-status"));
        $(this).toggleClass("btn-primary").toggleClass("btn-danger");
        createRule();
    });
    //固定选择框事件绑定
    $("select.select-fixed").each(function () {
        $(this).on("change", function () {
            var selectVal = $(this).val();
            $(this).parent().prev().find("input").val(selectVal);
            createRule();
        });
    });
    //固定文本框事件绑定
    $("input.input-fixed").each(function () {
        $(this).on("keyup", function () {
            createRule();
        })
    })
}

//生成rules
function createRule() {
    var propertyNum = 0;
    var rules = "";
    var context = $("div#rule-edit-tool");
    var everyWord = $(context).find("strong");
    var qaTag = context.find("span");
    //关键词-前输入框内的值
    var keywordAhead = $("input#keyword-txt-ahead").val();
    //规则名输入框内的值
    var ruleName = $("input#input-rule-name").val();
    //关键词-后输入框内的值
    var keywordBehind = $("input#keyword-txt-behind").val();
    //所有限定对象元素
    var restricts = $("div#restrict-space").find("input.restrict-txt");
    //词语限定字符串
    var restrictString = "";
    if (restricts) {
        restrictString += "|";
        $(restricts).each(function () {
            var restrict = $(this).val();
            var restrictLabel = $(this).parent().prev().children("label");
            var restrictDefault = $(restrictLabel).text();
            if (restrict) {
                if (restrict.length > 2) {
                    if (restrict.indexOf("++") === 0) {
                        restrictString += restrictLabel.attr("data-index") + "=" + restrict + ",";
                    } else {
                        if (restrict.indexOf("++") > 0) {
                            alert("序号为：" + restrictLabel.attr("data-index") + " 的词语限定中间不能出现(++)");
                            $(this).val("");
                            return;
                        }
                        if (restrict.indexOf("+") === 0) {
                            alert("序号为：" + restrictLabel.attr("data-index") + " 的词语限定不能以（+）开头");
                            $(this).val("");
                            return;
                        }
                        restrictString += restrictDefault + restrict + ",";
                    }
                } else {
                    if (restrict != "+") {
                        if (restrict == 1) {
                            restrictString += restrictDefault.substring(0, restrictDefault.length - 1) + ",";
                        } else {
                            restrictString += restrictDefault + restrict + ",";
                        }
                    }
                }
            }
        });
        if (restrictString.length > 2) {
            restrictString = restrictString.substring(0, restrictString.length - 1);
        } else {
            restrictString = "";
        }
    }
    if (restrictString.length - restrictString.lastIndexOf(",") === 1 && restrictString.length != 0) {
        restrictString = restrictString.substring(0, restrictString.length - 1);
    }
    rules += (qaTag.attr("data-status") === "false") ? "" : "QA:";
    for (var wd = 0; wd < everyWord.length; wd++) {
        var word = everyWord[wd];
        if ($(word).attr("data-type") == "ignore") {
            $(word).attr("data-num", 0);
            rules += $(word).text() + "[NA]";
        } else if ($(word).attr("data-type") == "property") {
            propertyNum++;
            if (propertyNum > 6) {
                alert("变量最多能有6个");
                $(word).attr("data-type", "ignore");
                $(word).attr("data-num", 0);
                $(word).next().show().next().hide();
                rules += $(word).text() + "[NA]";
            } else {
                $(word).attr("data-num", propertyNum);
                rules += $(word).text() + "[" + propertyNum + "]";
            }
        } else if ($(word).attr("data-type") == "symbol") {
            rules += $(word).text();
        }
    }
    rules += restrictString + "~#" + keywordAhead + "," + ruleName + "," + keywordBehind + ".";
    $("textarea#rule").val(rules);
}

//恢复默认函数
function makeToolDefault() {
    var ruleEditTool = $("div.edit-tool-space");
    $(ruleEditTool).children("span").attr("data-status", "false");
    $(ruleEditTool).find("button#qa").removeClass("btn-danger").addClass("btn-primary");
    $(ruleEditTool).find("strong[data-type='property']").each(function () {
        $(this).attr("data-type", "ignore");
        $(this).attr("data-num", 0);
    });
    $(ruleEditTool).find("i.property").show();
    $(ruleEditTool).find("i.ignore").hide();
    $(ruleEditTool).find("input").each(function () {
        $(this).val("");
    });
}

//关键字转成变量函数
function makeWordProperty(btnProperty) {
    $(btnProperty).prev("strong").attr("data-type", "property");
    $(btnProperty).hide().next("i").show();
    createRule();
    createRestrictTool();
}

//忽略关键字函数
function makeWordIgnore(btnIgnore) {
    $(btnIgnore).hide().prev("i").show().prev("strong").attr("data-type", "ignore");
    createRule();
    createRestrictTool();
}

//生成词语限定工具函数
function createRestrictTool() {
    var ruleEditTool = $("div#rule-edit-tool");
    //本地保存预设限定名
    var presetRestrict = window.localStorage.getItem("dataPreRestrictName");
    //预设限定下拉框选项字符串
    var restrictOptionHtml = "";
    presetRestrict = presetRestrict.split("\n");
    if (presetRestrict[0].length > 1) {
        for (var num = 0; num < presetRestrict.length; num++) {
            restrictOptionHtml += "<option value='" + presetRestrict[num] + "'>" + presetRestrict[num] + "</option>";
        }
    } else {
        restrictOptionHtml += "<option value='none'>无预设限定</option>";
    }
    var restrictToolHtml = "";
    var everyWord = $(ruleEditTool).find("strong");
    for (var wd = 0; wd < everyWord.length; wd++) {
        var word = everyWord[wd];
        if ($(word).attr("data-type") == "property") {
            var wordIndex = $(word).attr("data-num");
            restrictToolHtml += "<form class='form-inline' role='form' style=' margin: 0 0 5px 0 '>" +
                "<div class='form-group' style='margin-right: 5px'>" +
                "<label class='form-control' data-index='" + wordIndex + "' style='width: 120px;'>" +
                +wordIndex +
                "=+" +
                $(word).text() + "+" +
                "</label>" +
                "</div>" +
                "<div class='form-group' style='margin-right: 5px'>" +
                "<label class='sr-only' for='restrict-txt'>词语限定文本</label>" +
                "<input type='text' class='form-control restrict-txt' id='restrict-txt' style='width: 130px;'>" +
                "</div>" +
                "<div class='form-group' style='margin-right: 5px'>" +
                "<input class='btn btn-warning none-restrict' id='none-restrict' value='none'style='width: 60px;'>" +
                "</div>" +
                "<div class='form-group' style='margin-right: 5px'>" +
                "<select class='form-control select-change' id='preset-restrict'>" +
                restrictOptionHtml +
                "</select>" +
                "</div>" +
                "</form>";
        }
    }
    $("div#restrict-space").html(restrictToolHtml).find("select.select-change").each(function () {
        $(this).on("change", function () {
            var selectVal = $(this).val();
            $(this).parent().prev().prev().find("input").val(selectVal);
            createRule();
        })
    });
    $("div#restrict-space").find("input.restrict-txt").each(function () {
        $(this).on("keyup", function () {
            createRule();
        })
    });
    $("div#restrict-space").find("input.none-restrict").each(function () {
        $(this).on("click", function () {
            var txtRestrict=$(this).parent().prev().find("input");
            if(txtRestrict.val()=="none"){
                txtRestrict.val("");
            }else{
                txtRestrict.val("none");
            }
            createRule();
        })
    });
    createRule();
}

//加载完毕执行

$(function () {
    var presetRuleName = window.localStorage.getItem("dataPreRuleName");
    if (!presetRuleName) window.localStorage.setItem("dataPreRuleName", "空");
    var presetRestrict = window.localStorage.getItem("dataPreRestrictName");
    if (!presetRestrict) window.localStorage.setItem("dataPreRestrictName", "空");
    var presetFixedWords = window.localStorage.getItem("dataPreFixedWords");
    if (!presetFixedWords) window.localStorage.setItem("dataPreFixedWords", "大前天\n前天\n昨天\n今天\n明天\n后天\n大后天\n星期一\n星期二\n星期三\n星期四\n星期五\n星期六\n星期天");
    var replacePattern=window.localStorage.getItem("replacePattern");
    if(!replacePattern)window.localStorage.setItem("replacePattern","我们-landey\n我-landey\n你们-碧碧\n你-碧碧");
    var fileUrl=window.localStorage.getItem("fileUrl");
    if(!fileUrl)window.localStorage.setItem("fileUrl","空");

    //加载编辑工具已保存rules
    $("textarea#save-space").val(window.localStorage.getItem("rulesData"));
    //rule编辑按钮事件绑定
    $("#btn-rule-edit").on("click", function () {
        $("div#rule-editor").toggle();
        getRulesInfo();
    });
    //规则编辑页关闭按钮事件绑定
    $("button.close-rule-editor").on("click", function () {
        $("div#rule-editor").hide();
    });
    //规则编辑工具关闭按钮事件绑定
    $("button.close-rule-editor-tool").on("click", function () {
        $("div#rule-editor-tool").hide();
    });

    //保存rule按钮事件绑定
    $("button#save-rules").on("click", function () {
        var saveSpace = $("textarea#save-space");
        var rule = $("textarea#rule");
        //关键词-前输入框内的值
        var keywordAhead = $("input#keyword-txt-ahead").val();
        //规则名输入框内的值
        var ruleName = $("input#input-rule-name").val();
        //关键词-后输入框内的值
        var keywordBehind = $("input#keyword-txt-behind").val();
        if (keywordAhead == "" || keywordBehind == "" || ruleName == "") {
            alert("关键词序号或规则名不能为空");
            return;
        }
        if (saveSpace.val().indexOf(rule.val()) === -1) {
            saveSpace.val(saveSpace.val() + "\n" + rule.val());
            window.localStorage.setItem("rulesData", saveSpace.val());
        } else {
            alert("rules已存在");
        }
        refreshRuleNum();
    });
    //恢复默认按钮事件绑定s
    $("button.btn-default").on("click", function () {
        makeToolDefault();
        createRule();
    });
    //标记按钮事件绑定
    $("button.btn-mark").on("click", function () {
        var target = "#" + $(this).attr("data-target");
        $(target).toggleClass("text-danger");
    });
    //上一句按钮事件绑定
    $("button#btn-prev-sen").on("click", function () {
        var targetIdNum = $(this).attr("data-target");
        if (targetIdNum >= 1) {
            var btnId;
            $("table#test-info").find("button.btn-rule-edit").each(function () {
                btnId = $(this).attr("data-target");
                //alert(btnId);
                if (targetIdNum === btnId) {
                    //alert("foundTarget");
                    editRules(this);
                }
            });
        } else {
            alert("没有上一句");
        }
    });
    //下一句按钮事件绑定
    $("button#btn-next-sen").on("click", function () {
        var targetIdNum = $(this).attr("data-target");
        //alert(targetIdNum);
        var btnRuleEdits = $("table#test-info").find("button.btn-rule-edit");
        if (targetIdNum <= btnRuleEdits.length) {
            var btnId;
            for (var b = 0; b < btnRuleEdits.length; b++) {
                btnId = btnRuleEdits[b].getAttribute("data-target");
                if (btnId === targetIdNum) {
                    //alert("findTarget");
                    editRules(btnRuleEdits[b]);
                    break;
                }
            }
        } else {
            alert("已是最后一句");
        }
        /*
        $("table#test-info").find("button.btn-rule-edit").each(function () {
            var btnId=$(this).attr("data-target");
            if(targetIdNum==btnId){
                editRules(this);

            }
        });
        alert("已是最后一句");*/
    });
    //清空按钮事件绑定
    $("button.clean-save-space").on("click", function () {
        var saveSpace = $("textarea#save-space");
        $(saveSpace).val("");
        window.localStorage.setItem("rulesData", $(saveSpace).val());
        $("em#rule-num-tag").text("0");
    });
    //预设名打开按钮事件绑定
    $("button.btn-open").each(function () {
        $(this).on("click", function () {
            var targetId = $(this).attr("data-target");
            var item = $(this).attr("data-item");
            var target = $("#" + targetId);
            var itemValue = window.localStorage.getItem(item);
            if (!itemValue) {
                itemValue = "空";
                window.localStorage.setItem(item, itemValue);
            }
            $(target).show().find("textarea").val(itemValue);
        });
    });
    //预设名确认按钮事件绑定
    $("button.btn-confirm").each(function () {
        $(this).on("click", function () {
            var item = $(this).attr("data-item");
            var itemValue = $(this).parent().parent().find("textarea").val();
            window.localStorage.setItem(item, itemValue);
            $(this).parent().parent().hide();
        })
    });
    //替换规则按钮事件绑定
    $("input#replace-pattern").on("click",function () {
        var dataItem=$(this).attr("data-item");
        var dataStatus=$(this).attr("data-status");
        var optionSpcace=$("textarea#id_knowledge");
        if(dataStatus==="read"){
            var pattern=window.localStorage.getItem(dataItem);
            $(optionSpcace).val(pattern);
            $(this).attr("data-status","write");
            $(this).attr("value","保存替换规则");
        }
        if(dataStatus==="write"){
            window.localStorage.setItem(dataItem,$("textarea#id_knowledge").val());
            $(this).attr("data-status","read");
            $(this).attr("value","读取替换规则");
            $(optionSpcace).val("");
        }
    });
    //人称替换按钮事件绑定
    $("input#replace-nr").on("click",function () {
        var fileTextarea=$("textarea#id_knowledge");
        var replaceFile=$(fileTextarea).val();
        var replacePattern=window.localStorage.getItem("replacePattern");
        var patterns=replacePattern.split("\n");
        if(patterns.length!==0){
            patterns.sort().reverse();
        }
        var matchWords=[],replaceWords=[];
        for(var num=0;num<patterns.length;num++){
            var pattern=patterns[num].split("-");
            matchWords[num]=pattern[0];
            replaceWords[num]=pattern[1];
        }
        for(var num2=0;num2<matchWords.length;num2++){
            //alert(matchWords[num2]);
            var regStr="/"+matchWords[num2]+"/gi";
            replaceFile=replaceFile.replace(eval(regStr),replaceWords[num2]);
            //alert(replaceFile);
        }
        $(fileTextarea).val(replaceFile);
    });
    //规则还原按钮事件绑定
    $("input#rule-recover").on("click", function () {
        var fileTextarea = $("textarea#id_knowledge");
        var fileOfRules = $(fileTextarea).val();
        var rules = fileOfRules.split("\n");
        //alert(rules.length);
        for (var i = 0; i < rules.length; i++) {
            if (rules[i]) {
                if (rules[i].indexOf("|")) {
                    rules[i] = rules[i].split("|")[0];
                } else {
                    rules[i] = rules[i].split("~")[0];
                }
                do {
                    rules[i] = rules[i].replace(/\[[^\]]*\]/gi, "");
                    //alert(rules[i]);
                } while (rules[i].indexOf("[") > -1)
            }
        }
        var fileRecovered = "";
        for (var j = 0; j < rules.length; j++) {
            if(rules[j]){
                if(rules[j].indexOf("QA:")==0){
                    rules[j]=rules[j].substring(3,rules[j].length);
                    //alert(rules[j]);
                }
                fileRecovered += rules[j] + "\n";
            }
        }
        $(fileTextarea).val(fileRecovered);
    });
    //配置文件查重按钮事件绑定
    /*$("input#config-file-confirm").on("click",function(){
        var fileTextarea=$("textarea#id_knowledge");
        var fileOfConfig=fileTextarea.val();
        var configs=fileOfConfig.split("\n");
        var configsSplit=configs;
        var configsStr=configs;
        var indexNum;
        var resultStr="";
        for(var c=0;c<configs.length;c++){
            //alert(configs[c]);
            configsSplit[c]=(configs[c].split("+").sort());
            //alert(configsSplit[c]);
            configsStr[c]="";
            for(var d=0;d<configsSplit[c].length;d++){
                alert("拼接");
                configsStr[c]=configsStr[c]+configsSplit[c][d];
            }
        }
        //alert(""+configs[0]);
        for(var r=0;r<configsStr.length;r++){
            for(var r2=0;r2<configsStr.length;r2++){
                if(r!==r2){
                    alert(configsStr[r]+"and"+configsStr[r2]);
                    if(configsStr[r]===configsStr[r2]){
                        resultStr+=configs[r]+"\n"+configs[r2]+"\n重复"+"\n";
                    }
                }
            }
        }
        fileTextarea.val(resultStr);
    });*/

});
