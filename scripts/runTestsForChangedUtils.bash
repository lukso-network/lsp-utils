testsToRun=""
filesWithChanges=""

# check the utils and tests for the ones that have been changed
# if changes found run tests for those utils
for utilPath in src/**/*.ts;
do
    # if util is `index.ts` skip to the next element
    if [ $utilPath == "src/index.ts" ] || [ $utilPath == "src/constants/index.ts" ];
    then
        continue
    fi;

    # ignore src/typechain/ folder
    if [[ $utilPath == src/typechain/* ]];
    then
        continue
    fi;

    # cache util file name
    ## remove the shortest string from left to right which ends in "/"
    utilName=${utilPath#*/}
    ## remove the longest string from right to left which starts with "."
    utilName=${utilName%%.*}

    # generate test path for util
    testPath="tests/$utilName.test.ts"

    # check is test path is not included in `testsToRun`
    if [[ $testsToRun != *$testPath* ]]; then
        # check if there is diff in the util, if there is, make sure to run its test
        if [[ $(git diff origin/develop --name-only $utilPath) != "" ]];
        then
            testsToRun+=" $testPath"
            filesWithChanges+=" $utilPath"
        else
            # check if there is diff in the test file, if there is, make sure to run its test
            if [[ $(git diff origin/develop --name-only $testPath) != "" ]];
            then
                testsToRun+=" $testPath"
            fi;
        fi;
    fi;
done

# check the dependencies of utils that were not changed
# if dependency will have its tests run, then run the tests for the unchanged util as well
for utilPath in src/**/*.ts;
do
    # if util is `index.ts` skip to the next element
    if [ $utilPath == "src/index.ts" ] || [ $utilPath == "src/constants/index.ts" ];
    then
        continue
    fi;

    # ignore src/typechain/ folder
    if [[ $utilPath == src/typechain/* ]];
    then
        continue
    fi;

    # cache util file name
    ## remove the shortest string from left to right which ends in "/"
    utilName=${utilPath#*/}
    ## remove the longest string from right to left which starts with "."
    utilName=${utilName%%.*}

    # generate test path for util
    testPath="tests/$utilName.test.ts"

    # check is test path is not included in `testsToRun`
    if [[ $testsToRun != *$testPath* ]]; then
        # check if there is diff in the util or test file
        # if there is, make sure to run its test
        if [[ $(git diff origin/develop --name-only $utilPath) == "" ]] || 
        [[ $(git diff origin/develop --name-only $testPath) == "" ]];
        then
            # get the imports of the util
            imports=$(grep "^import" $utilPath)

            index=1;
            # read each line from `imports`
            while read line; do 
                # remove the longest string from left to right which ends in "from "
                dependency=${line##*"from "}
                # remove the shortest string from left to right which ends in "'"
                dependency=${dependency#*\'}
                # remove the shortest string from right to left which satrts with "'"
                dependency=${dependency%\'*}

                # check if dependency starts with './' or '../', which means it is from 'src/'
                if [[ $dependency =~ ^./[a-zA-Z](.*)$ ]] ||
                [[ $dependency =~ ^../[a-zA-Z](.*)$ ]];
                then
                    # remove the shrotest string from left to right which ends in "/"
                    dependency=${dependency#*/}

                    # check if the dependency of the `utilPath` has changes
                    if [[ $filesWithChanges == *$dependency* ]];
                    then
                        # if yes, then run the tests for this util as well
                        testsToRun+=" $testPath"
                    fi;
                fi;

                index=$(($index+1)); 
            done <<< "$imports"
        fi;
    fi;
done

# if there are tests to run, run them
if [[ $testsToRun != "" ]];
then
    npx hardhat test $testsToRun
fi;
