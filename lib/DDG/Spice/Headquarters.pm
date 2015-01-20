package DDG::Spice::Headquarters;
# ABSTRACT: Shows the headquarters of the given company.

use DDG::Spice;

# Metadata
name "Headquarters";
description "Shows the headquarters of the given company.";
source "Wikipedia";
icon_url "/i/wikipedia.org.ico";

primary_example_queries "headquarters of duckduckgo", "twitter headquarters";
secondary_example_queries "facebook hq";
category "geography";
topics "everyday", "geography";
code_url "https://github.com/hathix/zeroclickinfo-spice/blob/master/lib/DDG/Spice/Headquarters.pm";

attribution twitter => ["https://twitter.com/hathix", "Neel Mehta"],
            github  => ["https://github.com/hathix", "Neel Mehta"],
            web     => ["http://hathix.com", "Neel Mehta"];

# Real code
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

# uppercases the first letter in each word in the string; e.g. "duck duck go" => "Duck Duck Go"
sub sentencecase($)
{
    my @words = split /[ -]/, shift;
    my @ucwords = ();
    
    my $word;
    foreach $word (@words){
        push @ucwords, ucfirst $word;
    }
    
    return join ' ', @ucwords;
}

handle remainder => sub {
    if($_){
        # sentence case plays better with wikipedia's api
        return sentencecase trim $_;
    }
    return;
};

1;