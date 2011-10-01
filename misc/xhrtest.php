<?php
    $rnd = mt_rand(0, 2000);
    usleep($rnd);
    echo $_GET['test_id'];
