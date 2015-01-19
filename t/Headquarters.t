#!/usr/bin/env perl

use strict;
use warnings;
use Test::More;
use DDG::Test::Spice;

ddg_spice_test(
    [qw( DDG::Spice::Headquarters )],
    'headquarters of duckduckgo' => test_spice(
        '/js/spice/headquarters/duckduckgo',
        call_type => 'include',
        caller => 'DDG::Spice::Headquarters',
    ),
    'headquarters duckduckgo' => test_spice(
        '/js/spice/headquarters/duckduckgo',
        call_type => 'include',
        caller => 'DDG::Spice::Headquarters',
    ), 
    'hq of duckduckgo' => test_spice(
        '/js/spice/headquarters/duckduckgo',
        call_type => 'include',
        caller => 'DDG::Spice::Headquarters',
    ),
    'hq duckduckgo' => test_spice(
        '/js/spice/headquarters/duckduckgo',
        call_type => 'include',
        caller => 'DDG::Spice::Headquarters',
    ), 
    'duckduckgo headquarters' => test_spice(
        '/js/spice/headquarters/duckduckgo',
        call_type => 'include',
        caller => 'DDG::Spice::Headquarters',
    ), 
    'duckduckgo hq' => test_spice(
        '/js/spice/headquarters/duckduckgo',
        call_type => 'include',
        caller => 'DDG::Spice::Headquarters',
    ), 
);

done_testing;
