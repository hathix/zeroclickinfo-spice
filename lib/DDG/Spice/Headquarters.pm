package DDG::Spice::Headquarters;
# ABSTRACT: Returns the headquarters of the given company.

use DDG::Spice;

triggers startend => 'headquarters of', 'headquarters', 'hq', 'hq of', 'corporate headquarters of', 'corporate headquarters', ;
spice to => 'http://en.wikipedia.org/w/api.php?action=query&prop=revisions&continue=&rvprop=content&format=json&redirects=1&titles=$1';
spice wrap_jsonp_callback => 1;

# Removes leading and trailing whitespace from a string.
sub trim($)
{
	my $string = shift;
	$string =~ s/^\s+//;
	$string =~ s/\s+$//;
	return $string;
}

handle remainder => sub {
    if($_){
        return trim $_;
    }
    return;
};

1;