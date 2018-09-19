function getRagic(database, data, callback, onerror){
    return $.ajax({ // get hook
        url: "https://www.ragic.com/scrabble/collections/"+database+"?v=3&api",
        beforeSend: function(xhr) { 
          xhr.setRequestHeader("Authorization", "Basic XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX=="); 
        },
        type: 'POST',
        dataType: 'jsonp',
        processData: false,
        contentType: 'application/json',
        data: data,
        // jsonpCallback: Math.random().toString(36).substring(7)+"_callback",
        error: function(){
          console.log('Error');
          if (onerror !== undefined)
             onerror();
        },
    }).done(function(data){
        if (callback !== undefined)
            callback(data)
    });
}
function upadateProgress(elem, value, max) {
    max = max || 100;
    if (value === undefined || value === null) {
        elem.dataset.valuenow = ( parseInt(elem.dataset.valuenow)>=max*0.6 ) ? parseInt(elem.dataset.valuenow) + 0.5 : parseInt(elem.dataset.valuenow) + 1;
    } else
        elem.dataset.valuenow = value;
    elem.style.width = elem.dataset.valuenow + "%";
}
wordForm.addEventListener('submit', function(e){
    e.preventDefault();
    var input = wordForm.input.value.toUpperCase();
    var pbars = {
        def: document.querySelector('.progress-bar.def'),
        hook: document.querySelector('.progress-bar.hook'),
        ana: document.querySelector('.progress-bar.ana')
    };
    $.each(pbars, function(i, v){upadateProgress(v, 0)} );
    if (input == "")
        return;

    wait.innerHTML = "Verifying word…";
    $.each(pbars, function(i, v){$(v).removeClass('bg-danger')} );
    setTimeout(function(){
        $.each(pbars, function(i, v){$(v).removeClass('no-transition')} );
    }, 600);
    var timer = setInterval(function(){
        upadateProgress(pbars.def, null, 33.33);
    }, 1000);
    getRagic(2, 'where=1000036,eq,'+input, function(data){
        // get definitions
        var i = 0;
        // def.innerHTML = "";

        for (var d in data) {
            // var d = data[d];
        //  def.innerHTML += `<p><strong>${input[0] + input.toLowerCase().slice(1)}</<strong> (${d.class}.) ${d.variations}<br>${d.define}<p>`;
            i++;
        }
        clearInterval(timer);
        if (i == 0){
            // def.innerHTML = "Definition not found.";
            wait.innerHTML = "No meaning found, fetching ends.";
            upadateProgress(pbars.def, 100);
            pbars.def.classList.add('bg-danger');
            $.each(pbars, function(i, v){$(v).addClass('no-transition')} );
            return;
        }
        upadateProgress(pbars.def, 33.33);
        var timer1 = setInterval(function(){
            upadateProgress(pbars.hook, null, 33.33);
        }, 1000);
        var timer2 = setInterval(function(){
            upadateProgress(pbars.ana, null, 33.33);
        }, 1000);

        wait.innerHTML = "";
        front.innerHTML = back.innerHTML = ana.innerHTML = "Fetching data…";

        getRagic(1, 'where=1000001,regex,'+input+'&where=1000035,eq,'+(input.length+1), function(data){
            // get front and back hook
            var inputLen = input.length;
            var hook = {front:[], back:[]};
            for (var d in data) {
                var word = data[d].word;
                if (word.substr(0, inputLen) == input)
                    hook.back.push(word);
                else if (word.substr(1, inputLen) == input)
                    hook.front.push(word);
            }
            var out = formatOutputArray(hook.front);
            front.innerHTML = out == "" ? '<span class="py-1 px-2 m-2 d-inline-block">Nothing found.</span>' : out;
            out = formatOutputArray(hook.back);
            back.innerHTML = out == "" ? '<span class="py-1 px-2 m-2 d-inline-block">Nothing found.</span>' : out;
            clearInterval(timer1);
            upadateProgress(pbars.hook, 33.33);
            pbars.hook.classList.add('no-transition');
        }, function(){
            front.innerHTML = back.innerHTML = "Error, try again later!";
        });
        getRagic(1, 'where=1000002,regex,'+input.split('').sort().join('')+'where=1000035,eq,'+input.length, function(data){
            // get anagrams
            var inputLen = input.length;
            var anag = [];
            for (var d in data) {
                var word = data[d].word;
                if (word != input)
                    anag.push(word);
            }
            var out = formatOutputArray(anag);
            ana.innerHTML = out == "" ? '<span class="py-1 px-2 m-2 d-inline-block">Nothing found.</span>' : out;
            clearInterval(timer2);
            upadateProgress(pbars.ana, 33.33);
            pbars.ana.classList.add('no-transition');
        }, function(){
            ana.innerHTML = "Error, try again later!";
        });
    }, function(){
        wait.innerHTML = '<span class="text-danger d-inline-block">Cannot fetch data!</span>';
    });
    return false;
});
rackForm.addEventListener('submit', function(e){
    e.preventDefault();
    var input = rackForm.input.value.toUpperCase();
    if (input == "")
        return;
    var pbar = document.querySelector('.progress-bar.rack');
    upadateProgress(pbar, 2);
    setTimeout(function(){
        pbar.classList.remove('no-transition');
    }, 600);
    var timer = setInterval(function(){
        upadateProgress(pbar);
    }, 1000);

    racks.innerHTML = "Fetching data…";
    getRagic(1, 'where=1000002,regex,'+input.split('').sort().join('')+'&where=1000035,eq,'+input.length, function(data){
        // get anagrams
        var inputLen = input.length;
        var alpha = [];
        for (var d in data) {
            var word = data[d].word;
            alpha.push(word);
        }
        var out = formatOutputArray(alpha);
        racks.innerHTML = out == "" ? '<span class="py-1 px-2 m-2 d-inline-block">Nothing found.</span>' : out;
        clearInterval(timer);
        upadateProgress(pbar, 100);
        pbar.classList.add('no-transition');
    }, function(){
        racks.innerHTML = "Error, try again later!";
    });
    return false;
});
addOne.addEventListener('click', function(){
    var input = rackForm.input.value.toUpperCase();
    var ai = 0, abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var aj = 0, alpha = input.split('').sort().join('');
    var pbar = document.querySelector('.progress-bar.add1');
    if (input == "")
        return;
    upadateProgress(pbar, 2);
    setTimeout(function(){
        pbar.classList.remove('no-transition');
    }, 600);
    var timer = setInterval(function(){
        upadateProgress(pbar);
    }, 1000);
    var anchor = ai;
    var funcs = [];
    while (ai<abc.length) {
        if (abc[ai]>=alpha[aj]) {
            if (ai > 0) {
                funcs.push(getRagic(1, 'where=1000002,regex,'+alpha.substr(0, aj)+'['+abc[anchor]+'-'+abc[ai-1]+']'+alpha.substr(aj)+'&where=1000035,eq,'+(input.length+1), function(d){console.log(d)}));
                anchor = ai;
            }
            aj++;
        }
        else
            ai++;
        if (aj == alpha.length)
            break;
    }
    funcs.push(getRagic(1, 'where=1000002,regex,'+alpha+'['+abc[anchor]+'-Z]&where=1000035,eq,'+(input.length+1)));

    add1.innerHTML = "Fetching data…";
    $.when(...funcs).done(function(...res){
        add1.innerHTML = "";
        var add_i = -1; // extract the added char
        var summary = {};
        abc.split('').forEach(c=>summary[c]=new Array());
        console.log(summary);
        res.forEach(function(r){
            var data = r[0];
            for (var d in data) {
                // find  which char is inserted
                for (add_i=0; add_i<alpha.length;) {
                    if (data[d].alpha[add_i] !== alpha[add_i])
                        break;
                    add_i++
                }
                var added_char = data[d].alpha[add_i];

                if (added_char !== undefined)
                    summary[added_char].push(data[d].word);
            }
        });
        add_i = 0;
        for (var c in summary) {
            if (summary[c].length <= 0)
                continue;
            add1.innerHTML += '<h5 class="m-2">'+c+"</h5>";
            add1.innerHTML += formatOutputArray(summary[c]);
            add_i++;
        }
        if (add_i == 0)
            add1.innerHTML = '<span class="py-1 px-2 m-2 d-inline-block">Nothing found.</span>';
        clearInterval(timer);
        upadateProgress(pbar, 100);
        pbar.classList.add('no-transition');
    }).fail(function(){
    }).fail(function(){
        add1.innerHTML = "Error, try again later!";
    });
});
patternForm.addEventListener('submit', function(e){
    e.preventDefault();
    var input = patternForm.input.value.toUpperCase();
    var pbar = document.querySelector('.progress-bar.pattern');
    if (input == "")
        return;
    upadateProgress(pbar, 2);
    setTimeout(function(){
        pbar.classList.remove('no-transition');
    }, 600);
    var timer = setInterval(function(){
        upadateProgress(pbar);
    }, 1000);

    matched.innerHTML = "Fetching data…";
    getRagic(1, 'where=1000001,regex,'+input.replace(/_/g,'[A-Z]')+'&where=1000035,eq,'+input.length, function(data){
        // console.log(data);
        var inputLen = input.length;
        var out = "";
        for (var d in data) {
            out += '<span class="bg-light py-1 px-2 m-2 d-inline-block rounded">'+data[d].word+"</span>";
        }
        matched.innerHTML = out === "" ? '<span class="py-1 px-2 m-2 d-inline-block">Nothing found.</span>' : out;
        clearInterval(timer);
        upadateProgress(pbar, 100);
        pbar.classList.add('no-transition');
    });
    return false;
}, function(){
    matched.innerHTML = "Error, try again later!";
});
function formatOutputArray(arr){
    return arr.map(function(el){
        return '<span class="bg-light py-1 px-2 m-2 d-inline-block rounded">'+el+"</span>";                     
    }).join('');
}