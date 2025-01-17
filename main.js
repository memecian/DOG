/**
 * Variables
 */
var constructorTemplatesShorted = {};
let $textareaProto = $('#css-code-result').clone().removeAttr('id').addClass('css-code-result');
/**
 * Functions
 */
// Доступность хранилища
function storageAvailable(type) {
	try {
		var storage = window[type], x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) { console.log(e); return false; }
}
// Скачивание файла
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
/**
 * Events
 */
// Загрузка шаблона
$(document).ready(function () {
    for (var constructorTemplatesItem in constructorTemplates) {
        if (constructorTemplates.hasOwnProperty(constructorTemplatesItem)) {
            constructorTemplatesShorted[constructorTemplates[constructorTemplatesItem]['key']] = {
                'code': constructorTemplates[constructorTemplatesItem]['code'],
                'multiple': constructorTemplates[constructorTemplatesItem]['multiple'],
                'single': constructorTemplates[constructorTemplatesItem]['single']
            };
            $('<option>')
                .attr('value', constructorTemplates[constructorTemplatesItem]['key'])
                .html(constructorTemplates[constructorTemplatesItem]['title'])
                .appendTo('#generationMethod');
        }
    }
    $('#prev-char-btn').attr('disabled', true);
    $('#next-char-btn').attr('disabled', true);
    //console.log(constructorTemplatesShorted);
    // Если не работает локальное хранилище, выключить кнопку сохранения
    if (!storageAvailable('localStorage'))
        $('#save-button')
            .prop('disabled', true)
            .attr('title', "Your browser doesn't support save operation on localStorage");
    // Если все же работает...
    else
        // Попробовать получить сохраненные данные
        if(localStorage.getItem('appConfig') !== null)
            // Отобразить кнопку загрузки
            $('#load-button').removeClass('d-none');
});

// Генерация кода
$('#mainform').bind('submit', function (evt) {
    let constructedCSS = '';
    let multipleFlag = ($('#character-list .carousel-inner').children().length>1?true:false);
    $('#result-area').empty();
    $('#previewFrame').empty();
    $('#download-button').prop('disabled', false);
    // Сброс состояния кнопок загрузки
    $('#download-all').removeClass('disabled');
    $('#download-each').removeClass('disabled');
    if(multipleFlag) {
        if (mainform.elements['generation-method'].value == 'jiinh') {
            alert("Original method doesn't support multiple characters!\nEnabling separated generation...");
            let $characterCollection = $('#character-list .carousel-inner').children();
            for (var i = 0; i < $('#character-list .carousel-inner').children().length; i++) {
                constructedCSS = constructorTemplatesShorted[$('#generationMethod').val()]['code'];
                constructedCSS = constructedCSS
                    .replace(/___DiscordUserID___/g, mainform.elements['discord-user-id'][i].value)
                    .replace(/___DiscordAvatarLinkPassive___/g, mainform.elements['discord-avatar-link-passive'][i].value)
                    .replace(/___DiscordAvatarLinkActive___/g, mainform.elements['discord-avatar-link-active'][i].value)
                    .replace(/___AvatarBrightness___/g, mainform.elements['avatar-brightness'][i].value)
                    .replace(/___AvatarJumpingHeight___/g, mainform.elements['avatar-jumping-height'][i].value)
                    .replace(/___AvatarJumpingHeightUnits___/g, mainform.elements['avatar-jumping-height-units'][i].value);
                $textareaProto.clone().val(constructedCSS).appendTo('#result-area');
            }
            // Генерация превью
            generatePreview(mainform.elements, constructedCSS);
            // Оставить включенной только загрузку всех возможных вариантов
            $('#download-all').addClass('disabled');
        } else {
            constructedCSS = constructorTemplatesShorted[$('#generationMethod').val()]['code'];
            let $characterCollection = $('#character-list .carousel-inner').children();
            for (var i = 0; i < $('#character-list .carousel-inner').children().length; i++) {
                constructedCSS += constructorTemplatesShorted[$('#generationMethod').val()]['multiple'];
                constructedCSS = constructedCSS
                    .replace(/___DiscordUserID___/g, mainform.elements['discord-user-id'][i].value)
                    .replace(/___DiscordAvatarLinkPassive___/g, mainform.elements['discord-avatar-link-passive'][i].value)
                    .replace(/___DiscordAvatarLinkActive___/g, mainform.elements['discord-avatar-link-active'][i].value)
                    .replace(/___AvatarBrightness___/g, mainform.elements['avatar-brightness'][i].value)
                    .replace(/___AvatarJumpingHeight___/g, mainform.elements['avatar-jumping-height'][i].value)
                    .replace(/___AvatarJumpingHeightUnits___/g, mainform.elements['avatar-jumping-height-units'][i].value);
            }
            // Генерация превью
            generatePreview(mainform.elements, constructedCSS);
            $textareaProto.clone().val(constructedCSS).appendTo('#result-area');
        }
    } else {
        constructedCSS = constructorTemplatesShorted[$('#generationMethod').val()]['code'] +  (constructorTemplatesShorted[$('#generationMethod').val()]['single']!=undefined?constructorTemplatesShorted[$('#generationMethod').val()]['single']:'');
        constructedCSS = constructedCSS
            .replace(/___DiscordUserID___/g, mainform.elements['discord-user-id'].value)
            .replace(/___DiscordAvatarLinkPassive___/g, mainform.elements['discord-avatar-link-passive'].value)
            .replace(/___DiscordAvatarLinkActive___/g, mainform.elements['discord-avatar-link-active'].value)
            .replace(/___AvatarBrightness___/g, mainform.elements['avatar-brightness'].value)
            .replace(/___AvatarJumpingHeight___/g, mainform.elements['avatar-jumping-height'].value)
            .replace(/___AvatarJumpingHeightUnits___/g, mainform.elements['avatar-jumping-height-units'].value);
        // Генерация превью
        generatePreview(mainform.elements, constructedCSS);
        $textareaProto.clone().val(constructedCSS).appendTo('#result-area');
        // Выключить кнопку множественной скачки
        $('#download-each').addClass('disabled');
    }
    $('#previewCSS').val(constructedCSS);
    return false;
});

// Генерация превью
function generatePreview(sourceData, css) {
    let $framedocument = $('<body>');
    // Собрать шаблон
    $framedocument.html(`<style>${css}</style><div id="app-mount"><div style="font-family:Whitney,sans-serif;background-color:transparent;"><div class="voice-container"><ul class="voice-states"></ul></div></div></div><script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="helper.js"></script>`);
    // Получить объект списка участников голосового канала
    let $speakerList = $framedocument.children('#app-mount').children('div').children('.voice-container').children('.voice-states');
    // Получить флаг множественности
    let multipleFlag = ($('#character-list .carousel-inner').children().length>1?true:false);
    // Массив участников
    let speakers = [];
    // Заполнить массив
    if(multipleFlag) {
        for (var i = 0; i < sourceData['discord-user-id'].length; i++) {
            speakers[i] = {
                "discord-user-id": sourceData['discord-user-id'][i].value,
                "discord-avatar-link-passive": sourceData['discord-avatar-link-passive'][i].value,
                "discord-avatar-link-active": sourceData['discord-avatar-link-active'][i].value,
                "avatar-brightness": sourceData['avatar-brightness'][i].value,
                "avatar-jumping-height": sourceData['avatar-jumping-height'][i].value,
                "avatar-jumping-height-units": sourceData['avatar-jumping-height-units'][i].value
            };
        }
    } else {
        speakers[0] = {
            "discord-user-id": sourceData['discord-user-id'].value,
            "discord-avatar-link-passive": sourceData['discord-avatar-link-passive'].value,
            "discord-avatar-link-active": sourceData['discord-avatar-link-active'].value,
            "avatar-brightness": sourceData['avatar-brightness'].value,
            "avatar-jumping-height": sourceData['avatar-jumping-height'].value,
            "avatar-jumping-height-units": sourceData['avatar-jumping-height-units'].value
        };
    }
    // Заполнить список говорящих
    for (var i = 0; i < speakers.length; i++) {
        // Текущий элемент
        let currentSpeaker = speakers[i];
        // Элемент изображения
        let $currentSpeakerImage = $('<img>')
            .attr('src', currentSpeaker['discord-avatar-link-passive'])
            .attr('data-reactid', currentSpeaker['discord-user-id'])
            .addClass('avatar');
        // Элемент списка
        $('<li>')
            .attr('data-reactid', currentSpeaker['discord-user-id'])
            .addClass('voice-state')
            .append($currentSpeakerImage)
            .appendTo($speakerList);
    }
    // Записать во фрейм предварительного просмотра
    $('#previewIFrame').attr('srcdoc', $framedocument.html());
}

// Дублирование слота
function duplicateSlot(evt) {
    $('#character-list .carousel-inner .carousel-item:last-child')
        .clone()
        .removeClass('active')
        .appendTo('#character-list .carousel-inner');
    $('#character-list').carousel('next');
    $('#next-char-btn').prop('disabled', true);
    $('#remove-slot').prop('disabled', false);
}
$('#duplicate-slot').on('click', duplicateSlot);

// Удаление слота
$('#remove-slot').on('click', function (evt) {
    // Получить текущий элемент
    var tmp = $('#character-list .carousel-inner .carousel-item.active');
    // Переключить карусель
    $('#character-list').carousel('prev');
    // Удалить сохраненный элемент
    tmp.detach();
});

// Сброс формы
function resetForm(evt) {
    if($('#character-list .carousel-inner .carousel-item').length > 1) {
        do {
            $('#character-list .carousel-inner .carousel-item:last-child').detach();
        } while ($('#character-list .carousel-inner .carousel-item').length > 1);
        $('#character-list .carousel-inner .carousel-item:last-child').addClass('active');
    }
    $('#prev-char-btn').attr('disabled', 'disabled');
    $('#next-char-btn').attr('disabled', 'disabled');
    $('#result-area textarea').val('');
    $('#previewCSS').val('');
    $('#previewFrame').empty();
    // Сброс состояния кнопок загрузки
    $('#download-all').removeClass('disabled');
    $('#download-each').removeClass('disabled');
}
$('#mainform').on('reset', resetForm);

// Управление каруселью
$('#character-list').on('slide.bs.carousel', function (evt) {
    //console.log(evt);
    if(evt.to == $('#character-list .carousel-inner').children().length-1) {
        $('#prev-char-btn').removeAttr('disabled');
        $('#next-char-btn').attr('disabled', 'disabled');
    } else if (evt.to == 0 && evt.direction == 'right') {
        $('#prev-char-btn').attr('disabled', 'disabled');
        $('#next-char-btn').removeAttr('disabled');
    } else {
        $('#prev-char-btn').removeAttr('disabled');
        $('#next-char-btn').removeAttr('disabled');
    }
});
// Сохранение формы
$('#save-button').on('click', function (evt) {
    // Определить объект конфигурации
    let mainConfig = {
        "generation-method": mainform.elements['generation-method'].value,
        "elements": []
    };
    // Аватар один, или в комплекте
    let multipleFlag = ($('#character-list .carousel-inner').children().length>1?true:false);
    // Если один, то все просто...
    if(multipleFlag) {
        // Получение массива потомков карусели
        let $characterCollection = $('#character-list .carousel-inner').children();
        // Для каждого потомка
        for (var i = 0; i < $('#character-list .carousel-inner').children().length; i++) {
            mainConfig['elements'][i] = {
                "discord-user-id": mainform.elements['discord-user-id'][i].value,
                "discord-avatar-link-passive": mainform.elements['discord-avatar-link-passive'][i].value,
                "discord-avatar-link-active": mainform.elements['discord-avatar-link-active'][i].value,
                "avatar-brightness": mainform.elements['avatar-brightness'][i].value,
                "avatar-jumping-height": mainform.elements['avatar-jumping-height'][i].value,
                "avatar-jumping-height-units": mainform.elements['avatar-jumping-height-units'][i].value,
                "discord-user-alias": mainform.elements['discord-user-alias'][i].value || ""
            };
        }
    } else {
        mainConfig['elements'][0] = {
            "discord-user-id": mainform.elements['discord-user-id'].value,
            "discord-avatar-link-passive": mainform.elements['discord-avatar-link-passive'].value,
            "discord-avatar-link-active": mainform.elements['discord-avatar-link-active'].value,
            "avatar-brightness": mainform.elements['avatar-brightness'].value,
            "avatar-jumping-height": mainform.elements['avatar-jumping-height'].value,
            "avatar-jumping-height-units": mainform.elements['avatar-jumping-height-units'].value,
            "discord-user-alias": mainform.elements['discord-user-alias'].value || ""
        };
    }
    localStorage.setItem('appConfig', JSON.stringify(mainConfig));
});
// Загрузка конфигурации
$('#load-button').on('click', function (evt) {
    // Предварительный сброс формы
    resetForm(evt);
    // Получить конфигурацию
    let mainConfig = JSON.parse(localStorage.getItem('appConfig'));
    // Выбрать метод в списке
    $('#generationMethod').val(mainConfig['generation-method']);
    console.log(mainConfig);
    // Применить конфигурацию
    if(mainConfig.elements.length > 1) {
        for (var i = 0; i < mainConfig.elements.length; i++) {
            // Дублирование при последующих итерациях
            if(i < mainConfig.elements.length - 1) { duplicateSlot(evt) }
            // Задание параметров
            mainform.elements['discord-user-id'][i].value = mainConfig.elements[i]['discord-user-id'];
            mainform.elements['discord-user-alias'][i].value = mainConfig.elements[i]['discord-user-alias'] || "";
            mainform.elements['discord-avatar-link-passive'][i].value = mainConfig.elements[i]['discord-avatar-link-passive'];
            mainform.elements['discord-avatar-link-active'][i].value = mainConfig.elements[i]['discord-avatar-link-active'];
            mainform.elements['avatar-brightness'][i].value = mainConfig.elements[i]['avatar-brightness'];
            mainform.elements['avatar-jumping-height'][i].value = mainConfig.elements[i]['avatar-jumping-height'];
            mainform.elements['avatar-jumping-height-units'][i].value = mainConfig.elements[i]['avatar-jumping-height-units'];
        }
    } else {
        mainform.elements['discord-user-id'].value = mainConfig.elements[0]['discord-user-id'];
        mainform.elements['discord-user-alias'].value = mainConfig.elements[0]['discord-user-alias'] || "";
        mainform.elements['discord-avatar-link-passive'].value = mainConfig.elements[0]['discord-avatar-link-passive'];
        mainform.elements['discord-avatar-link-active'].value = mainConfig.elements[0]['discord-avatar-link-active'];
        mainform.elements['avatar-brightness'].value = mainConfig.elements[0]['avatar-brightness'];
        mainform.elements['avatar-jumping-height'].value = mainConfig.elements[0]['avatar-jumping-height'];
        mainform.elements['avatar-jumping-height-units'].value = mainConfig.elements[0]['avatar-jumping-height-units'];
    }
    setTimeout(function () {
        $('#character-list .carousel-inner .carousel-item')
            .removeClass('carousel-item-next carousel-item-left active');
        $('#character-list .carousel-inner .carousel-item:last-child')
            .addClass('active');
    }, 1000);
});
// Скачивание текстовиков
$('#download-each').on('click', function (evt) {
    let constructedCSS = '';
    let multipleFlag = ($('#character-list .carousel-inner').children().length>1?true:false);
    if(multipleFlag) {
        constructedCSS = constructorTemplatesShorted[$('#generationMethod').val()]['code'];
        let $characterCollection = $('#character-list .carousel-inner').children();
        for (var i = 0; i < $('#character-list .carousel-inner').children().length; i++) {
            constructedCSS = constructorTemplatesShorted[$('#generationMethod').val()]['code'] +  (constructorTemplatesShorted[$('#generationMethod').val()]['single']!=undefined?constructorTemplatesShorted[$('#generationMethod').val()]['single']:'');
            constructedCSS = constructedCSS
                .replace(/___DiscordUserID___/g, mainform.elements['discord-user-id'][i].value)
                .replace(/___DiscordAvatarLinkPassive___/g, mainform.elements['discord-avatar-link-passive'][i].value)
                .replace(/___DiscordAvatarLinkActive___/g, mainform.elements['discord-avatar-link-active'][i].value)
                .replace(/___AvatarBrightness___/g, mainform.elements['avatar-brightness'][i].value)
                .replace(/___AvatarJumpingHeight___/g, mainform.elements['avatar-jumping-height'][i].value)
                .replace(/___AvatarJumpingHeightUnits___/g, mainform.elements['avatar-jumping-height-units'][i].value);
            let filename = mainform.elements['discord-user-alias'][i].value || mainform.elements['discord-user-id'][i].value + '.txt';
            download(filename, constructedCSS);
        }
    } else {
        constructedCSS = constructorTemplatesShorted[$('#generationMethod').val()]['code'] +  (constructorTemplatesShorted[$('#generationMethod').val()]['single']!=undefined?constructorTemplatesShorted[$('#generationMethod').val()]['single']:'');
        constructedCSS = constructedCSS
            .replace(/___DiscordUserID___/g, mainform.elements['discord-user-id'].value)
            .replace(/___DiscordAvatarLinkPassive___/g, mainform.elements['discord-avatar-link-passive'].value)
            .replace(/___DiscordAvatarLinkActive___/g, mainform.elements['discord-avatar-link-active'].value)
            .replace(/___AvatarBrightness___/g, mainform.elements['avatar-brightness'].value)
            .replace(/___AvatarJumpingHeight___/g, mainform.elements['avatar-jumping-height'].value)
            .replace(/___AvatarJumpingHeightUnits___/g, mainform.elements['avatar-jumping-height-units'].value);
        let filename = mainform.elements['discord-user-alias'].value || mainform.elements['discord-user-id'].value + '.txt';
        download(filename, constructedCSS);
    }
});
$('#download-all').on('click', function (evt) {
    // Получить готовый код
    let constructedCSS = $('#result-area>textarea').val();
    // Инициировать скачивание файла
    download('exportedCSS.txt', constructedCSS);
});
// Экспорт конфигурации
$('#export-button').on('click', function (evt) {
    if(localStorage.getItem('appConfig') !== null)
        download('DOGSettings.json', localStorage.getItem('appConfig'));
    else
        alert('Save config first!');
});
// Импорт конфигурации
$('#import-button').on('click', function (evt) {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        // getting a hold of the file reference
        var file = e.target.files[0];
        // setting up the reader
        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            var content = readerEvent.target.result; // this is the content!
            try {
                let testObject = JSON.parse(content)
                // Файл должен содержать нужные параметры
                if(testObject['generationMethod']!='')
                    localStorage.setItem('appConfig', content);
                else
                    throw 'Incorrect JSON';
                // Отобразить кнопку загрузки и кликнуть по ней
                $('#load-button')
                    .removeClass('d-none')
                    .click();
            } catch (e) {
                alert(e);
            }
        }
    }
    input.click();
});
// Переключение языков
$('#language-selector>*').on('click', function (evt) {
    // Отмечаем элемент активным
    $(evt.target).addClass('active').siblings().removeClass('active');
    // Загрузить профиль языка
    var lang = $(evt.target).attr('data-lang');
    $.getJSON(`lang/${lang}.json`, (data) => {
        // Обновление метаданных страницы
        $.each(data.metadata, (key, val) => {
            $(`[data-langkey="metadata_${key}"]`).html(val);
        });
        document.title = data.metadata.title;
        // Обновление элементов управления
        $.each(data.control, (key, val) => {
            $(`[data-langkey="control_${key}"]`).html(val);
        });
        // Обновление элементов формы
        $.each(data.form, (key, val) => {
            $(`[data-langkey="form_${key}"]`).html(val);
        });
        // Обновление подсказок формы
        $.each(data.placeholder, (key, val) => {
            $(`[data-langkey="placeholder_${key}"]`).attr('placeholder', val);
        });
        // Обновление элементов приложения
        $.each(data.app, (key, val) => {
            $(`[data-langkey="app_${key}"]`).html(val);
        });
        // Обновление инструкции
        $(`[data-langkey="instruction"]`).html('');
        $.each(data.instruction, (key, val) => {
            $('<li>').html(val).appendTo(`[data-langkey="instruction"]`);
        });
    });
});
