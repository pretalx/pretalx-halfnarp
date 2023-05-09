jQuery(function () {
    const $submissions = $('.submissions .submission');
    configureCsrf($("[name=csrfmiddlewaretoken]").val());

    $submissions.on('click', function () {
        $(this).toggleClass('preferred');
    }).on('click', deduplicate(savePreferredTalks));

    function savePreferredTalks() {
        const preferredTalkIds = $submissions.filter(function () {
            return $(this).hasClass('preferred')
        }).map(function () {
            return $(this).data('id')
        }).get();
        console.log('start save', 'preferredTalkIds=', preferredTalkIds)

        return jQuery.ajax(window.location.href + '/my-preferences', {
            method: 'POST',
            dataType: 'json',
            data: JSON.stringify(preferredTalkIds),
            contentType: 'application/json',
        })
    }

})

function configureCsrf(csrfToken) {
    const csrfSafeMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethods.includes(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrfToken);
            }
        }
    });
}

function deduplicate(action) {
    let actionInProgress = false, actionPending = false;

    return function applyActionOrSetFlag() {
        if (actionInProgress) {
            console.log('action still running, setting pending flag')
            actionPending = true;
            return;
        }

        actionInProgress = true;
        console.log('apply action')
        action().then(function () {
            console.log('action done')
            actionInProgress = false;
            if (actionPending) {
                console.log('pending flag set, re-run action')
                applyActionOrSetFlag();
                actionPending = false;
            }
        }).catch(function () {
            console.log('action failed')
            actionPending = false;
            actionInProgress = false;
        })
    }
}
