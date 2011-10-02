<?php
    $rnd = mt_rand(0, 2);
    sleep($rnd);
    echo $_GET['test_id'] . ': ' . $rnd;
