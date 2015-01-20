package DDG::Spice::Headquarters;
# ABSTRACT: Returns the headquarters of the given company.

use DDG::Spice;

triggers startend => 'headquarters of', 'headquarters', 'hq', 'hq of';
spice to => 'http://en.wikipedia.org/w/api.php?action=query&prop=revisions&continue=&rvprop=content&format=json&titles=$1';
spice wrap_jsonp_callback => 1;

handle remainder => sub {
    if($_){
        return $_;
    }
    return;
};

1;