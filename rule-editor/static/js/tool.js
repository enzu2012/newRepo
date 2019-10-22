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
function checkRuleNum() {
    var ruleNums = $("textarea#save-space").val().match(/,rule-/gi);
    return (!ruleNums) ? "0" : ruleNums.length;
}

//刷新规则数目显示
function refreshRuleNum() {
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
    //词语限定工具显示位置
    var restrictToolSpace = $("div#restrict-space");
    //清空编辑工具
    ruleEditToolSpace.html("");
    //清空规则名工具
    ruleNameToolSpace.html("");
    //清空词语限定工具
    restrictToolSpace.html("");
    //根据测试结果获取的词组数组
    var words = [];
    //标点符号数组
    var symbol = ["，", "。", "、", "？", "！", ",", ".", "?", "!"];
    refreshRuleNum();
    //编辑工具按钮组字符串
    //fa fa-minus-square
    var ruleEditBtns = "<div class='btn btn-primary btn-xs btn-word property text-justify pull-left' style='margin-right: 10px'>[NA]</div>" +
        "<div class='btn btn-danger btn-xs btn-word ignore text-justify pull-left' style='display: none;margin-right: 10px'>[CD]</div>";
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
    var dataFixedWords = window.localStorage.getItem("dataPreFixedWords");
    var fixedWords = dataFixedWords.split("\n");
    //alert(fixedWords);
    //将固定词组放入words数组
    for (var i = 0; i < fixedWords.length; i++) {
        words.push(fixedWords[i]);
    }
    words = words.sort().reverse();
    //alert(words);
    //按语句顺序匹配words中的关键词，生成rules编辑工具
    var loopNum = 0;
    //QA按钮
    ruleEditToolSpace.append("<span data-status='false'></span><button class='btn btn-primary btn-xs pull-left' id='qa'><b>QA:</b></button>&nbsp;&nbsp;&nbsp;");
    //匹配关键词 生成词组及词组控制按钮
    do {
        for (var w = 0; w < words.length; w++) {
            if (sentence.indexOf(words[w]) === 0) {
                sentence = sentence.substring(words[w].length, sentence.length);
                ruleEditToolSpace.append(
                    (symbol.indexOf(words[w]) !== -1) ?
                        "<div  data-type='symbol' class='h3 text-justify word pull-left strong' style='margin: 0px '>" + words[w] + "</div>"
                        :
                        "<div  data-type='ignore' class='h3 text-justify word pull-left strong' style='margin: 0px '>" + words[w] + "</div>" + ruleEditBtns
                );
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
                ruleEditToolSpace.append(
                    "<div data-type='ignore' class='h3 text-justify word pull-left strong' style='margin: 0px '>" + sentence.substring(0, minIndex) + "</div>"
                    + ruleEditBtns
                );
                sentence = sentence.substring(minIndex, sentence.length);
                //alert(sentence);
                loopNum = 0;
            } else {
                ruleEditToolSpace.html("");
                $("div#rule-editor-tool").show();
                $("textarea#rule").val("关键词匹配错误，请检查\"" + sentence.substring(0, 4) + "\"位置");
                return;
            }
        }
    } while (sentence.length !== 0);


    //插入规则名组件
    ruleNameToolSpace.html(createRuleNameToolHtml("init"));

    changeKeywordsNumOption();
    ruleEditToolSpace.show();
    bandForRuleEditBtns();
    bandForRuleNameTool();
    bandForBtnAddRelation();
    createRule();
    return;
}

//生成规则名输入框及下拉框
function createRuleNameToolHtml(status) {
    var ruleNameToolHtml = "";
    var nameOptionHtml = "";
    var presetRuleName = window.localStorage.getItem("dataPreRuleName");
    var ruleNameLastTimeUsed = window.localStorage.getItem("ruleNameLastTimeUsed");
    presetRuleName = presetRuleName.split("\n");
    if (presetRuleName[0].length > 2) {
        for (var num = 0; num < presetRuleName.length; num++) {
            nameOptionHtml += "<option value='" + presetRuleName[num] + "'>" + presetRuleName[num] + "</option>";
        }
    } else {
        nameOptionHtml += "<option value='none'>无预设规则名</option>";
    }
    ruleNameToolHtml += "<form class='form-inline' role='form' style=' margin: 0 0 5px 0 '>" +

        "<div class='form-group' style='margin-right: 3px;'>" +
        "<label class='sr-only' for='keyword-txt-ahead'>前关键词文本</label>" +
        "<input type='text' class='form-control input-fixed txt-num-ahead' value='限定词' style='width: 80px;'>" +
        "</div>" +
        "<div class='form-group' style='margin-right: 30px;'>" +
        "<select class='form-control select-fixed keyword-num-ahead'style='width: 32px;padding-left: 14px;padding-right: 0px' >" +
        "</select>" +
        "</div>" +

        "<div class='form-group' style='margin-right: 3px;'>" +
        "<label class='sr-only' for='input-rule-name'>规则名文本</label>" +
        "<input type='text'id='input-rule-name' class='form-control input-fixed txt-rule-name' value='" + (ruleNameLastTimeUsed ? ruleNameLastTimeUsed : "") + "' style='width: 260px;'>" +
        "</div>" +
        "<div class='form-group' style='margin-right: 30px;'>" +
        "<select class='form-control select-fixed' id='preset-rule-name'style='width: 32px;padding-left: 14x;padding-right: 0px' >" +
        nameOptionHtml +
        "</select>" +
        "</div>" +

        "<div class='form-group' style='margin-right: 3px;'>" +
        "<label class='sr-only' for='keyword-txt-behind'>后关键词文本</label>" +
        "<input type='text' class='form-control input-fixed txt-num-behind' value='关键词' style='width: 80px;'>" +
        "</div>" +
        "<div class='form-group' style='margin-right: 30px;'>" +
        "<select class='form-control select-fixed keyword-num-behind'style='width: 32px;padding-left: 14px;padding-right: 0px' >" +
        "</select>" +
        "</div>" +

        "<div class='form-group'>";
    if (status === "init") {
        ruleNameToolHtml += "<div class=' btn btn-success btn-xs' id='btn-add-new-relation'>新增</div>";
    } else {
        ruleNameToolHtml += "<div class=' btn btn-danger btn-xs' id='btn-remove-relation'>删除</div>";
    }
    ruleNameToolHtml += "</div>" +
        "</form>";
    return ruleNameToolHtml;
}


//修改关键词序号选择框内容

function changeKeywordsNumOption() {
    var keywordNum = $("#rule-edit-tool").find("div[data-type='property']").length;
    //生成关键词序号下拉框及输入框
    var optionHtml = "<option value='' disabled selected></option>" +
        "<option value='visitorname'>visitorname</option>";
    for (var i = 1; i <= keywordNum; i++) {
        optionHtml += "<option class='form-control' value='[" + i + "]'>[" + i + "]</option>";
    }
    $(".keyword-num-ahead").html(optionHtml);
    $(".keyword-num-behind").html(optionHtml);
}

//为编辑工具按钮绑定事件
function bandForRuleEditBtns() {
    //关键词后按钮事件绑定
    $("div.property").each(function () {
        $(this).on("click", function () {
            makeWordProperty(this);
            changeKeywordsNumOption();
        })
    });
    $("div.ignore").each(function () {
        $(this).on("click", function () {
            makeWordIgnore(this);
            changeKeywordsNumOption();
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

}

//为规则名组件绑定事件
function bandForRuleNameTool() {
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
    });

    $("div#btn-remove-relation").on("click", function () {
        $(this).parent().parent().remove();
        createRule();
    });
}

//增加新语义关系按钮函数绑定
function bandForBtnAddRelation() {

    $("div#btn-add-new-relation").on("click", function () {
        $("div#rule-name-space").append(createRuleNameToolHtml());
        changeKeywordsNumOption();
        bandForRuleNameTool();
        createRule();
    });
}

//生成rules
function createRule() {
    var propertyNum = 0;
    var rules = "";
    var context = $("div#rule-edit-tool");
    var everyWord = $(context).find("div.word");
    var qaTag = context.find("span");
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
                    if (restrict.indexOf("++") === 0 || restrict.indexOf("+*") === 0 || restrict.indexOf("+%") === 0) {
                        restrictString += restrictLabel.attr("data-index") + "=" + restrict + ",";
                    } else {
                        if (restrict.indexOf("++") > 0) {
                            alert("序号为：" + restrictLabel.attr("data-index") + " 的词语限定中间不能出现(++)");
                            //$(this).val("");
                            return;
                        }
                        if (restrict.indexOf("+") === 0) {
                            alert("序号为：" + restrictLabel.attr("data-index") + " 的词语限定不能以（+）开头");
                            //$(this).val("");
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
            if (propertyNum > 8) {
                alert("变量最好不要超过8个");
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
    rules += restrictString + "~" + creatRelationString();
    $("textarea#rule").val(rules);
}

//生成语义关系字符串（三元组字符串）
function creatRelationString() {
    //关键词-前输入框内的值
    var keywordAhead = "";
    //规则名输入框内的值
    var ruleName = "";
    //关键词-后输入框内的值
    var keywordBehind = "";
    //语义关系字符串
    var relationString = "";
    $("div#rule-name-space").find("form.form-inline").each(function () {
        keywordAhead = $(this).find("input.txt-num-ahead").val();
        keywordBehind = $(this).find("input.txt-num-behind").val();
        ruleName = $(this).find("input.txt-rule-name").val();
        relationString += "#" + keywordAhead + "," + ruleName + "," + keywordBehind + ".";
    });
    return relationString;
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
    $(btnProperty).prev("div.word").attr("data-type", "property");
    $(btnProperty).hide().next("div.btn-word").show();
    createRule();
    createRestrictTool();
}

//忽略关键字函数
function makeWordIgnore(btnIgnore) {
    $(btnIgnore).hide().prev("div.btn-word").show().prev("div.word").attr("data-type", "ignore");
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
    var everyWord = $(ruleEditTool).find("div.word");
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
                "<input class='btn btn-warning btn-xs none-restrict' id='none-restrict' value='none'style='width: 60px;'>" +
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
            var txtRestrict = $(this).parent().prev().find("input");
            if (txtRestrict.val() == "none") {
                txtRestrict.val("");
            } else {
                txtRestrict.val("none");
            }
            createRule();
        })
    });
    createRule();
}

//查找重复项函数
function removeDuplicateItems() {
    //alert("去重");
    var text = $("#id_knowledge").val();
    var textPure = "";
    var items = [];
    var itemsRemoved = [];
    var itemsDuplicate = [];
    var type = 0;
    if (text.indexOf("\n") === -1) {
        items = text.split("\+");
        type = 20;
    } else {
        items = text.split("\n");
        type = 10;
    }
    if (items.length) {
        items = items.filter(function (item) {
            return (!item) ? 0 : 1;
        });
        itemsRemoved = items.filter(function (item, index, arr) {
            if (arr.indexOf(item) === index) {
                return true;
            } else {
                if (itemsDuplicate.indexOf(item) === -1) {
                    itemsDuplicate.push(item)
                }
                return false;
            }
        });
    }
    if (type === 10) {
        for (var i = 0; i < itemsRemoved.length; i++) {
            textPure += itemsRemoved[i] + "\n";
        }
    } else if (type === 20) {
        for (var j = 0; j < itemsRemoved.length; j++) {
            textPure += itemsRemoved[j] + "\+";
        }
    }
    var textDuplicate = "";
    for (var k = 0; k < itemsDuplicate.length; k++) {
        textDuplicate += itemsDuplicate[k] + "\n";
    }
    if (confirm("原有条目：" + items.length + "\n重复条目：" + itemsDuplicate.length + "\n去重后条目：" + itemsRemoved.length + ((itemsDuplicate.length) ? "\n？？是否去除重复部分？？\n重复部分:\n" + textDuplicate : ""))) {
        $("#id_knowledge").val(textPure);
    }
}

function findDuplicateItems() {
    var textArea = $("#id_knowledge");
    var text = textArea.val();
    var items = [];
    var itemsDuplicate = [];
    if (text.indexOf("\n") === -1) {
        items = text.split("+");
    } else {
        items = text.split("\n");
    }
    if (items.length) {
        items = items.filter(function (item) {
            return (!item) ? 0 : 1;
        });
        itemsDuplicate = items.filter(function (item, index, arr) {
            if (arr.indexOf(item) !== index) {
                return true;
            } else {
                return false;
            }
        });
    }
    itemsDuplicate = itemsDuplicate.filter(function (item, index, self) {
        if ((!item) || self.indexOf(item) !== index) {
            return false;
        } else {
            return true;
        }
    });
    var textDuplicate = "";
    for (var k = 0; k < itemsDuplicate.length; k++) {
        textDuplicate += itemsDuplicate[k] + "\n";
    }
    if (confirm("原有条目：" + items.length + "\n重复条目：" + itemsDuplicate.length + ((itemsDuplicate.length) ? "\n是否获取重复条目??" : ""))) {
        if (!itemsDuplicate.length) {
            return;
        } else {
            textArea.val(textDuplicate);
        }
    }
}

function wipeSaveSpace() {
    var saveSpace = $("textarea#save-space");
    $(saveSpace).val("");
    window.localStorage.setItem("rulesData", $(saveSpace).val());
    $("em#rule-num-tag").text("0");
}

//工具使用说明函数

function toolNotice() {
    alert("生成工具：\n将测试单元内容放入编辑区，点击按钮生成rule编辑工具。\n人称替换：\n点击按钮将按照设置规则将编辑区对应内容替换，" +
        "替换前可以使用读取替换按钮查看替换规则\n规则还原：\n将规则放入编辑区，点击按钮可将规则还原成对应句子\n查找重复项：\n将内容放入编辑区，" +
        "点击按钮可查找重复项目。\nPS：内容可以是关键词，将按<行>为单位查找重复部分，也可以是《A+B+c+d+x+A+b》格式，如果内容为此格式不要存在空格");
}

//打开关闭设置页面

function openPageSetting() {
    $("div#page-setting").show();
}

function closePageSetting() {
    $("div#page-setting").hide();
}

//更换背景颜色函数

function changeBackgroundColorOfBody(color) {
    $("body").attr("style", "background-color:" + color);
}

//查找缺失变量函数

function findMissingProperty() {
    var propertySelected = [];
    var propertyRelationSelected;
    var propertyRelationShouldHave = [];
    var propertyName;
    var propertyRelationExist = ["operation_eqp", "operation_itf", "operation_location", "operation_deg", "operation_parm", "operation_direction",
        "ask_time", "eqp_to", "operation_prf", "eqp_all", "eqp_exclude", "eqp_parm", "eqp_itf", "eqp_verbalize", "eqp_mod", "parm_verbalize",
        "deg_eqp", "deg_floor", "deg_parm", "floor_operation", "floor_eqp", "floor_location", "floor_all", "floor_exclude", "floor_mod",
        "floor_verbalize", "location_deg", "location_eqp", "location_all", "location_exclude", "location_mod", "location_verbalize",
        "all_operation", "all_deg", "close_mod", "go_location", "go_floor", "to_deg", "polarity_parm", "polarity_eqp", "search_date",
        "search_period", "search_time", "search_hour", "search_minute", "search_key", "search_type", "search_location",
        "search_floor", "howmany_hours", "howmany_minutes", "operation_howlog", "operation_cycle", "operation_time", "cycle_time",
        "cycle_eqp", "time_eqp", "operation_period", "period_eqp", "cycle_period", "period_time", "operation_date", "date_eqp", "date_time", "date_period"];
    //查找状态为selected的变量卡片
    $("div#space-property-card").find("div.property-card[data-card-status='selected']").each(function () {
        //alert($(this).text());
        propertyName = $(this).attr("data-property-name").split("，");
        propertySelected.push(propertyName);
    });
    if (propertySelected.length < 2) {
        alert("选中信息点不能少于2");
        return
    }
    //alert(propertySelected.length+":"+propertySelected.toString());
    for (var ps_a = 0; ps_a < propertySelected.length; ps_a++) {
        for (var ps_b = 0; ps_b < propertySelected.length; ps_b++) {
            if (ps_a === ps_b) continue;
            propertyRelationSelected = propertySelected[ps_a][0] + "_" + propertySelected[ps_b][0];
            //alert(propertyRelationSelected);
            if (propertyRelationExist.indexOf(propertyRelationSelected) !== -1 && propertyRelationShouldHave.indexOf(propertyRelationSelected) === -1) {
                propertyRelationShouldHave.push(propertyRelationSelected + "");
            }
        }
    }
    //alert(propertyRelationShouldHave.toString());
    var formInfo = $("#textarea-form-info").val();
    var propertyNameChineseA;
    var propertyNameChineseB;
    var propertyNames;
    var propertyRelationCardsHtml = "";
    for (var prsh in propertyRelationShouldHave) {
        propertyNameChineseA = "";
        propertyNameChineseB = "";
        propertyNames = propertyRelationShouldHave[prsh].split("_");
        for (var ps in propertySelected) {
            //alert(propertyNames[0]+":"+propertySelected[ps][0]+"-------"+propertyNames[1]+":"+propertySelected[ps][0]);
            if (propertyNames[0] === propertySelected[ps][0]) {
                propertyNameChineseA = propertySelected[ps][1];
            } else if (propertyNames[1] === propertySelected[ps][0]) {
                propertyNameChineseB = propertySelected[ps][1]
            }
        }
        if (propertyNameChineseA === "" || propertyNameChineseB === "") {
            alert("获取中文变量名出错");
            break;
        } else {
            propertyRelationCardsHtml += "<div class='property-relation-card txt-black text-center warning'>"
                + propertyNameChineseA + ":" + propertyNameChineseB + "(" + propertyRelationShouldHave[prsh] + ")" + "</div>"
        }
    }
    $("div#space-property-relation-card").html(propertyRelationCardsHtml);

    if (!formInfo) return;
    if (formInfo.indexOf("\n") !== -1) {
        var formInfoLines = formInfo.split("\n");
        for (var fi in formInfoLines) {
            if (formInfoLines[fi].indexOf("chat_key") === -1) {
                continue;
            } else {
                formInfo = formInfoLines[fi];
                break;
            }
        }
    }
    //有效正则：/\_\d/gi         /[_]\d/gi
    /*formInfo = formInfo.replace(/\_\d/g, "");
    //alert(formInfo);
    var allPropertyRelationInForm = [];
    formInfo = (formInfo.indexOf(" : ") !== -1) ? (formInfo.split(" : ")[1]) : formInfo;
    formInfo = formInfo.split(",");
    var propertyRelationInForm;
    //alert(formInfo.toString());
    for (var fi in formInfo) {
        propertyRelationInForm = formInfo[fi].split("=")[0];
        if (propertyRelationInForm.indexOf("_") === -1) continue;
        if (allPropertyRelationInForm.indexOf(propertyRelationInForm) === -1) {
            allPropertyRelationInForm.push(propertyRelationInForm);
        }
    }*/
    //alert(allPropertyRelationInForm.toString());
    var prn;
    var fullPRN;
    var resultText = "";
    $("div.property-relation-card").each(function () {
        prn = $(this).text();
        fullPRN = prn;
        prn = prn.match(/\([^)]*\)/)[0];
        prn = prn.substring(1, prn.length - 1);
        //alert(prn+":::::"+allPropertyRelationInForm.toString());
        //alert(allPropertyRelationInForm.indexOf(prn));
        if (formInfo.indexOf(prn) !== -1) {
            $(this).toggleClass("default").toggleClass("warning");
        } else {
            resultText += fullPRN + ","
        }
    });
    if (resultText !== "") $("#textarea-form-info").val(resultText);
}

//变量卡片恢复默认
function makePropertyCardsDefault() {
    $("div#space-property-card").find("div.property-card").each(function () {
        $(this).removeClass("selected").addClass("default");
        $(this).attr("data-card-status", "default");
        $("div#space-property-relation-card").html("");
    });
}

//加载完毕执行

$(function () {
    var presetRuleName = window.localStorage.getItem("dataPreRuleName");
    if (!presetRuleName) window.localStorage.setItem("dataPreRuleName", "空");
    var presetRestrict = window.localStorage.getItem("dataPreRestrictName");
    if (!presetRestrict) window.localStorage.setItem("dataPreRestrictName", "空");
    var presetFixedWords = window.localStorage.getItem("dataPreFixedWords");
    if (!presetFixedWords) window.localStorage.setItem("dataPreFixedWords", "大前天\n前天\n昨天\n今天\n明天\n后天\n大后天\n星期一\n星期二\n星期三\n星期四\n星期五\n星期六\n星期天");
    var replacePattern = window.localStorage.getItem("replacePattern");
    if (!replacePattern) window.localStorage.setItem("replacePattern", "我们-landey\n我-landey\n你们-碧碧\n你-碧碧");
    var fileUrl = window.localStorage.getItem("fileUrl");
    if (!fileUrl) window.localStorage.setItem("fileUrl", "空");
    var lastUsedRuleName = window.localStorage.getItem("ruleNameLastTimeUsed");
    if (!lastUsedRuleName) window.localStorage.setItem("ruleNameLastTimeUsed", "rule-");
    //加载本地存储背景颜色
    var backgroundColor = window.localStorage.getItem("backgroundColorValue");
    if (backgroundColor) changeBackgroundColorOfBody(backgroundColor);

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
        var presetRuleName = window.localStorage.getItem("dataPreRuleName");
        var saveSpace = $("textarea#save-space");
        var rule = $("textarea#rule");
        var ruleNameLastTimeUsed = $("input#input-rule-name").val();
        if (presetRuleName.indexOf(ruleNameLastTimeUsed) === -1) {
            window.localStorage.setItem("dataPreRuleName", ruleNameLastTimeUsed + "\n" + presetRuleName);
        }
        if (saveSpace.val().indexOf(rule.val()) === -1) {
            saveSpace.val(saveSpace.val() + "\n" + rule.val());
            window.localStorage.setItem("rulesData", saveSpace.val());
            if (ruleNameLastTimeUsed === window.localStorage.getItem("ruleNameLastTimeUsed")) {
                window.localStorage.setItem("ruleNameLastTimeUsed", ruleNameLastTimeUsed);
            }
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
        wipeSaveSpace();

    });

    //关闭并清空按钮事件绑定
    $("button#close-and-wipe-save-space").on("click", function () {
        wipeSaveSpace();
        $("div#rule-editor").hide();
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
    $("input#replace-pattern").on("click", function () {
        var dataItem = $(this).attr("data-item");
        var dataStatus = $(this).attr("data-status");
        var optionSpcace = $("textarea#id_knowledge");
        if (dataStatus === "read") {
            var pattern = window.localStorage.getItem(dataItem);
            $(optionSpcace).val(pattern);
            $(this).attr("data-status", "write");
            $(this).attr("value", "保存替换规则");
        }
        if (dataStatus === "write") {
            window.localStorage.setItem(dataItem, $("textarea#id_knowledge").val());
            $(this).attr("data-status", "read");
            $(this).attr("value", "读取替换规则");
            $(optionSpcace).val("");
        }
    });
    //人称替换按钮事件绑定
    $("input#replace-nr").on("click", function () {
        var fileTextarea = $("textarea#id_knowledge");
        var replaceFile = $(fileTextarea).val();
        var replacePattern = window.localStorage.getItem("replacePattern");
        var patterns = replacePattern.split("\n");
        if (patterns.length !== 0) {
            patterns.sort().reverse();
        }
        var matchWords = [], replaceWords = [];
        for (var num = 0; num < patterns.length; num++) {
            var pattern = patterns[num].split("-");
            matchWords[num] = pattern[0];
            replaceWords[num] = pattern[1];
        }
        for (var num2 = 0; num2 < matchWords.length; num2++) {
            //alert(matchWords[num2]);
            var regStr = "/" + matchWords[num2] + "/gi";
            replaceFile = replaceFile.replace(eval(regStr), replaceWords[num2]);
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
        $(fileTextarea).val(fileOfRules);
    });


    //去除重复项按钮函数绑定
    $("input#btn-remove-duplicate-item").on("click", function () {
        removeDuplicateItems();
    });

    //查找重复项按钮函数绑定

    $("input#btn-find-duplicate-items").on("click", function () {
        findDuplicateItems();
    });

    //更换颜色函数绑定（div.color-card）
    $("div.color-card").each(function () {
        $(this).on("click", function () {
            var color = $(this).attr("data-color-value");
            if (color) {
                changeBackgroundColorOfBody(color);
                window.localStorage.setItem("backgroundColorValue", color);
            } else {
                alert("未获取到颜色信息");
            }
        });
    });

    //选定变量卡片点击事件绑定
    $("div#space-property-card").find("div.property-card").each(function () {
        $(this).on("click", function () {
            $(this).toggleClass("default").toggleClass("selected");
            if ($(this).attr("data-card-status") === "default") {
                $(this).attr("data-card-status", "selected");
            } else {
                $(this).attr("data-card-status", "default");
            }
        });
    });

    //打开查找缺失变量页面按钮函数绑定绑定
    $("input#btn-open-page-find-missing-property").on("click", function () {
        $("#page-find-missing-property").show();
    });

    //关闭查找缺失变量页面按钮函数绑定
    $("button#btn-close-page-find-missing-property").on("click", function () {
        makePropertyCardsDefault();
        $("#page-find-missing-property").hide();
    });

});
