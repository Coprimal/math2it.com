echo "1️⃣ Start copying..."
if [ "$1" == "-f" ]; then
    echo "🔥 Force copying"
    rm -rf ../math2it-v-nextjs-html/out
    mkdir ../math2it-v-nextjs-html/out
fi
cp -Rf out/* ../math2it-v-nextjs-html/out
cp public/robots.txt ../math2it-v-nextjs-html/out
cp public/sitemap.xml ../math2it-v-nextjs-html/out
echo "✅ End copying"

# (Temporarily disable) Use script ./ud_math2it-v-nextjs-html.sh instead
# echo "2️⃣ Go to math2it-v-nextjs-html folder"
# cd ../math2it-v-nextjs-html/
# echo "3️⃣ Updating lastUpdate.txt"
# echo `date +'%Y-%m-%d %H:%M:%S'` > lastUpdate.txt
# echo "4️⃣ Start updating math2it-v-nextjs-html to Github"
# git add .
# git commit -m "Updated: `date +'%Y-%m-%d %H:%M:%S'`"
# git push
# echo "✅ End updating"