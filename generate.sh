#!/bin/bash

source config.sh
rm -Rf generated
mkdir -p generated


quoteSubst() {
  IFS= read -d '' -r < <(sed -e ':a' -e '$!{N;ba' -e '}' -e 's/[&/\]/\\&/g; s/\n/\\&/g' <<<"$1")
  printf %s "${REPLY%$'\n'}"
}

function replaceVars {
    INPUT=$1
    IFS=""
    for  c in ${CONFIG[@]};
    do
        INPUT=$( sed "$c" <<< "$INPUT" )
    done
    echo "$INPUT"
}

OUTPUT="`cat template.html`"
#OUTPUT="`quoteSubst \"$OUTPUT\"`"
echo "$OUTPUT" > generated/debug.first.html

cd inc
for f in *;
do
    k="{$f}"
    v="`cat $f`"
    echo "Load component $k"
    v="`quoteSubst \"$v\"`"
    OUTPUT=$( sed "s/$k/$v/g" <<< "$OUTPUT" )
done
cd ..

echo "$OUTPUT" > generated/debug.after_components.html

NAV=""
PAGES=""
cd pages

for f in *;
do    
    echo "Load page $f"
    vv=`head -n 1 $f`
    vv=(${vv//;/ })
    declare -A vars
    for p in ${vv[@]}; do
        pp=(${p//=/ })
        k=${pp[0]} 
        v=${pp[1]}
        echo $k = $v
        vars[${k^^}]=$v
    done
    content=$(echo "`tail -n +2 $f`")

    if [ "${vars['NAV']}" != "hidden" -a "${vars['NAV']}" != "" ];
    then
        if [ "${vars['TYPE']}" = "page" ];
        then
            NAV="$NAV<a href=\"#${vars['ID']}\">${vars['NAV']}</a>"
        else
            NAV="$NAV<a target=\"_blank\" href=\"$content\">${vars['NAV']}</a>"
        fi
    fi
    if [ "${vars['TYPE']}" = "page" ];
    then
        PAGES="$PAGES<article id=\"${vars['ID']}\">$content</article>"
    fi    
done
cd ..
NAV="`quoteSubst \"$NAV\"`"

PAGES="`quoteSubst \"$PAGES\"`"


OUTPUT=$( sed "s/{nav.generated}/$NAV/g" <<< "$OUTPUT" )
echo $OUTPUT > generated/debug.after_nav.html

OUTPUT=$( sed "s/{pages.generated}/$PAGES/g" <<< "$OUTPUT" )

echo $OUTPUT > generated/debug.after_pages.html

OUTPUT="`replaceVars \"$OUTPUT\"`"

echo "$OUTPUT" > generated/index.html


cp -Rvf resources/* generated/

cd generated
for f in *.js
do
    echo "Replace vars for $f"
    replaceVars "`cat $f`" > $f
done

cd ..

rm -Rf dist
mkdir -p dist
cp -Rf generated/* dist/
cd dist
rm debug.*