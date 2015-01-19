(function (env) {
    "use strict";
    env.ddg_spice_headquarters = function(api_result){

        var fail = function(){
            return Spice.failed('headquarters');
        }
        
        // grab content
        var query = api_result.query || fail();
        var pages = query.pages || fail();

        // grab first page
        var page;
        for(pageId in pages){
          page = pages[pageId];
          break;
        }
        
        if (!page) {
            fail();
        }
        
        var companyName = page.title || fail();
        var revisions = page.revisions || fail();
        var revision = revisions[0] || fail();
        var content = revision["*"] || fail();
 
        // find each set of {{ ... }}
        var stack = []; 
        var sets = [];
        var length = text.length;

        for (var i = 0; i<length; /* nothing */){
          if(text.charAt(i) + text.charAt(i+1) === "{{"){
            // beginning of a set
            stack.push(i);
            i += 2;
          }
          else if(text.charAt(i) + text.charAt(i-1) === "}}"){
            // found the ending of a set; start of it was stack.pop()
            var start = stack.pop();
            var end = i;

            var set = text.substring(start, end+1);
            sets.push(set);

            i += 2;
          }
          else {
            // neither start nor finish
            i++;
          }
        }

        // find infobox, which is the set that begins with harbinger
        var harbinger = "{{Infobox company";
        var infoboxText = null;
        for (var i = 0; i < sets.length; i++){
            var set = sets[i];
            if (set.indexOf(harbinger) === 0){
                infoboxText = set;
            }
        }

        // must have infobox
        if (!infoboxText){
            fail();
        }

        // split infobox into items
        var items = infoboxText.split("\n");
        var infobox = {}; // each item is { title: text }
        for (var i = 0; i < items.length; i++){
            var item = items[i];
            var divide = item.indexOf("=");
            if (divide > -1) {
                var left = item.substring(0, divide);
                var right = item.substring(divide + 1);
                var titleArray = left.match(/\w+/);
                var title = titleArray[0];
                var text = right.trim();
                infobox[title] = text;
            }
        }

        /* ** BEGIN HEADQUARTERS-SPECIFIC CODE ** */

        // Cleans up a Wikipedia-formatted string, which can contain [[ ... ]] and <ref>'s.
        var cleanse = function(str){
            // get rid of <ref>'s
            str = str.replace(/<ref>[\S\s]+<\/ref>/g, "");

            // get rid of any <br />'s
            str = str.replace(/<br *\/?>/g, "");

            // replace stuff in [[ ... ]] with original
            str = str.replace(/\[\[([^\]]+)]]/g, function(match, group){
                // if group has a |, return what's on the right side (that's the "display" version
                var barIndex = group.indexOf("|");
                if (barIndex > -1){
                    return group.substring(barIndex + 1).trim();
                }
                else {
                    return group;
                }
            });

            return str;
        }

        var location = null;
        // walk down preference gradient until location found
        if (infobox.hq_location_city && infobox.hq_location_country){
            location = cleanse(infobox.hq_location_city) + ", " + cleanse(infobox.hq_location_country);
        }
        else if (infobox.hq_location_city){
            location = cleanse(infobox.hq_location_city);
        }
        else if(infobox.hq_location){
            location = cleanse(infobox.hq_location);
        }
        else if (infobox.location_city && infobox.location_country){
            location = cleanse(infobox.location_city) + ", " + cleanse(infobox.location_country);
        }
        else if (infobox.location_city){
            location = cleanse(infobox.location_city);
        }
        else if(infobox.location){
            location = cleanse(infobox.location);
        }
        else {
            // nothing found
            fail();
        }

        // answer = location
        if(location){
            // Success!
            
            var data = {
                name: companyName,
                headquarters: location
            };

            Spice.add({
                id: "headquarters",
                name: "Headquarters",
                
                // CHANGE BELOW
                data: data,
                meta: {
                    // sourceName: "Wikipedia",
                    // sourceUrl: 'https://en.wikipedia.org/wiki/' + companyName
                },
                templates: {
                    group: 'base',
                    options:{
                        content: Spice.headquarters.content,
                        moreAt: false
                    }
                }
            });
        }
        else {
            fail();
        }
    };
}(this));