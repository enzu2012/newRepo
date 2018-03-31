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
                "<td id='td-" + i + "'>" + testSentence + "</td>" +
                "<td>" +
                "<button data-target='td-" + i + "' class='btn btn-success btn-xs btn-sen-select'>选中</button>&nbsp;&nbsp;&nbsp;" +
                "<button data-target='td-" + i + "' class='btn btn-primary btn-xs btn-rule-edit'>编辑</button>" +
                "<span data-target='td-" + i + "' class='btn btn-primary btn-xs btn-rule-edit' style='display: none'>" + testResult[i] + "</span>" +
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

//生成编辑工具
function editRules(objBtnRuleEdit) {
    //更新标记按钮目标
    $("button.btn-mark").attr("data-target", $(objBtnRuleEdit).attr("data-target"));
    //要编辑的语句
    var sentence = $(objBtnRuleEdit).parent().prev().text();
    //待编辑语句测试结果
    var infoSentence = $(objBtnRuleEdit).next().text();
    //alert(infoSentence);
    //测试结果显示位置
    var ruleInfo = $("div#rule-info");
    //编辑工具显示位置
    var ruleEditTool = $("div#rule-edit-tool");
    ruleEditTool.html("");
    //根据测试结果获取的词组数组
    var words = [];
    //标点符号数组
    var symbol = ["，", "。", "、", "？", "！", ",", ".", "?", "!"];
    var rulesNum = $("textarea#save-space").val().match(/#visitorname/gi);
    //显示现有rules
    $("em#rule-num-tag").text((!rulesNum) ? "0" : rulesNum.length);
    //编辑工具按钮组字符串
    var ruleEditBtns = "<i class='btn btn-primary btn-xs property fa fa-plus-square fa-2x'></i><i class='btn btn-danger btn-xs ignore fa fa-minus-square fa-2x' style='display: none'></i>";
    //对匹配到的测试结果进行处理
    var infoHtml = "";
    var info1 = infoSentence.split("\n");
    infoHtml = "<h4>" + info1[0] + "</h4>";
    for (var info = 1; info < info1.length; info++) {
        infoHtml += "<h5>" + info1[info] + "</h5>";
    }
    //显示匹配到的测试结果
    ruleInfo.show().html(infoHtml);
    //提取括号包含的内容
    var ruleWords = infoSentence.match(/\([^)]*\)/gi);
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
    words = words.sort().reverse();
    //按语句顺序匹配words中的关键词，生成rules编辑工具
    var loopNum = 0;
    //QA按钮
    ruleEditTool.append("<span data-status='false'></span><button class='btn btn-primary btn-sm' id='qa'><b>QA:</b></button>&nbsp;&nbsp;&nbsp;");
    //匹配关键词 生成词组及词组控制按钮
    do {
        for (var w = 0; w < words.length; w++) {
            if (sentence.indexOf(words[w]) === 0) {
                sentence = sentence.substring(words[w].length, sentence.length);
                ruleEditTool.append((symbol.indexOf(words[w]) !== -1) ? "<strong data-type='symbol'>" + words[w] + "</strong>" : "<strong data-type='ignore' class='h3'>" + words[w] + "</strong>" + ruleEditBtns);
            }
        }
        if (loopNum++ === 100) {
            ruleEditTool.html("");
            $("div#rule-editor-tool").show();
            $("textarea#rule").val("关键词匹配错误，请检查\"" + sentence.substring(0, 4) + "\"位置");
            return;
        }
    } while (sentence.length !== 0);
    //生成编辑工具输入框及下拉框组件
    var inputAndSelectHtml = "";
    var preSetRuleName = $()
    inputAndSelectHtml += "<br><table style='margin-top: 10px'><tr><td style='width: 40%;margin-right: 10px'><input style='border:1px solid black' id='keyword-restrict' placeholder='词语限定'></td>";
    if (preSetRuleName.length !== 0) {
        var ruleFindNameSelect = "";
        var ruleListeningNameSelect = "";
        ruleFindNameSelect += "<select id='rule-find-name' class='rule-name' data-status='true'>";
        ruleListeningNameSelect += "<select id='rule-listening-name' class='rule-name' data-status='false' style='display: none'>";
        preSetRuleName.forEach(function (name) {
            ruleFindNameSelect += "<option value='" + name + "'>" + name + "</option>";
        });
        resListening.forEach(function (name) {
            ruleListeningNameSelect += "<option value='" + name + "'>" + name + "</option>";
        });
        ruleFindNameSelect += "</select>";
        ruleListeningNameSelect += "</select>";
        inputAndSelectHtml += "<td style='width: 40%;text-align: left'><button class='btn btn-default btn-xs' id='rule-name-select'><i class='fa fa-refresh'></i></button>";
        inputAndSelectHtml += ruleFindNameSelect;
        inputAndSelectHtml += ruleListeningNameSelect + "</td>";
    } else {
        inputAndSelectHtml += "<td style='width: 40%;'><input style='border:1px solid black' class='rule-name' data-status='true' placeholder='规则名'></td>";
    }
    inputAndSelectHtml += "<td style='width: 40%;'>关键词序号：<select id='keyword-num'><option value='[1]'>1</option><option value='[2]'>2</option><option value='[3]'>3</option><option value='[4]'>4</option><option value='[5]'>5</option><option value='[6]'>6</option></select></td>";
    inputAndSelectHtml += "<td></td></tr></table>";
    ruleEditTool.append(inputAndSelectHtml);
    ruleEditTool.show();
    bandForRuleEditBtns();
    createRule();
    return;

    ruleInfo.show().html("未匹配到结果");
    ruleEditTool.html("").hide();
    $("textarea#rule").val("");
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
    //选择框事件绑定
    $("select.rule-name,select#keyword-num").each(function () {
        $(this).on("change", function () {
            createRule();
        });
    });
    //切换选择框按钮事件绑定
    $("button#rule-name-select").on("click", function () {
        $("select.rule-name").each(function () {
            var status = $(this).attr("data-status");
            $(this).attr("data-status", (status === "false") ? "true" : "false");
        });
        $("select.rule-name[data-status='false']").hide();
        $("select.rule-name[data-status='true']").show();
        createRule();
    });
    //关键词序号选择框事件绑定
    $("input.rule-name,input#keyword-restrict").on("keyup", function () {
        createRule();
    });
}

//生成rules
function createRule() {
    var propertyNum = 0;
    var rules = "";
    var context = $("div#rule-edit-tool");
    var everyWord = $(context).find("strong");
    var qaTag = context.find("span");
    var ruleName = $(context).find(".rule-name[data-status='true']").val();
    var restrict = $(context).find("input#keyword-restrict").val();
    var keywordNum = $(context).find("select#keyword-num").val();
    rules += (qaTag.attr("data-status") === "false") ? "" : "QA:";
    for (var wd = 0; wd < everyWord.length; wd++) {
        var word = everyWord[wd];
        if ($(word).attr("data-type") == "ignore") {
            rules += $(word).text() + "[NA]";
        } else if ($(word).attr("data-type") == "property") {
            propertyNum++;
            if (propertyNum > 6) {
                alert("变量最多能有6个");
                $(word).attr("data-type", "ignore");
                rules += $(word).text() + "[NA]";
            } else {
                rules += $(word).text() + "[" + propertyNum + "]";
            }
        } else if ($(word).attr("data-type") == "symbol") {
            rules += $(word).text();
        }
    }
    rules += "|" + restrict + "~#visitorname," + ruleName + "," + keywordNum + ".";
    $("textarea#rule").val(rules);
}

//恢复默认函数
function makeToolDefault() {
    var ruleEditTool = $("div#rule-edit-tool");
    $(ruleEditTool).children("span").attr("data-status", "false");
    $(ruleEditTool).find("button#qa").removeClass("btn-danger").addClass("btn-primary");
    $(ruleEditTool).find("strong[data-type='property']").each(function () {
        $(this).attr("data-type", "ignore");
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
}

//忽略关键字函数
function makeWordIgnore(btnIgnore) {
    $(btnIgnore).hide().prev("i").show().prev("strong").attr("data-type", "ignore");
    createRule();
}

//加载完毕执行

$(function () {
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
        if (saveSpace.val().indexOf(rule.val()) === -1) {
            saveSpace.val(saveSpace.val() + "\n" + rule.val());
            window.localStorage.setItem("rulesData", saveSpace.val());
        } else {
            alert("rules已存在");
        }
        $("em#rule-num-tag").text((!saveSpace.val().match(/#visitorname/)) ? "0" : saveSpace.val().match(/#visitorname/gi).length);
    });
    //恢复默认按钮事件绑定s
    $("button.btn-default").on("click", function () {
        makeToolDefault();
        createRule();
    });
    //标记按钮事件绑定
    $("button.btn-mark").on("click", function () {
        var target = "td#" + $(this).attr("data-target");
        $(target).toggleClass("text-danger");
    });
    //上一句按钮事件绑定
    $("button#btn-prev-sen").on("click", function () {
        var sen = $("div#rule-info").find("h4").text();
        var senStr = sen.substring(sen.indexOf("-") + 2, sen.length);
        $("table#test-info").find("tr").each(function () {
            var senInTable = $(this).children("td:first").text();
            if (sen.indexOf(senInTable) != -1) {
                var btn = $(this).prev("tr").find("button");
                editRules(btn);
                return;
            }
        });
    })
    //下一句按钮事件绑定
    $("button#btn-next-sen").on("click", function () {
        var sen = $("div#rule-info").find("h4").text();
        var senStr = sen.substring(sen.indexOf("-") + 2, sen.length);
        $("table#test-info").find("tr").each(function () {
            var senInTable = $(this).children("td:first").text();
            if (sen.indexOf(senInTable) != -1) {
                var btn = $(this).next("tr").find("button.btn-rule-edit");
                editRules(btn);
                return;
            }
        });
    })
    //清空按钮事件绑定
    $("button.clean-save-space").on("click", function () {
        var saveSpace = $("textarea#save-space");
        $(saveSpace).val("");
        window.localStorage.setItem("rulesData", $(saveSpace).val());
    });
});
