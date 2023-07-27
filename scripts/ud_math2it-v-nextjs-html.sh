# Temporary script to update math2it-v-nextjs-html to Github

echo "2️⃣ Go to math2it-v-nextjs-html folder"
cd ../math2it-v-nextjs-html/
echo "3️⃣ Updating lastUpdate.txt"
echo `date +'%Y-%m-%d %H:%M:%S'` > lastUpdate.txt
echo "4️⃣ Start updating math2it-v-nextjs-html to Github"
git add .
git commit -m "Updated: `date +'%Y-%m-%d %H:%M:%S'`"
git push
echo "✅ End updating"