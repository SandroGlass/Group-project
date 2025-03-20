const part2=document.getElementById("part2");
const part3=document.getElementById("part3");

setTimeout(()=>{
    part2.classList.remove("hidden");
    part2.classList.add("visible");
},2000);
setTimeout(()=>{
    part3.classList.remove("hidden");
    part3.classList.add("visible");
},4000);

    
        // Intersection Observer APIを設定
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // スクリーンに入った場合 'visible' クラスを追加
                    entry.target.classList.add('visible');
                    entry.target.classList.remove('hidden');
                } else {
                    // スクリーン外に出た場合 'hidden' クラスを追加
                    entry.target.classList.add('hidden');
                    entry.target.classList.remove('visible');
                }
            });
        });

        // 全ての.hiddenクラスを監視対象に追加
        const hiddenElements = document.querySelectorAll('.hidden');
        hiddenElements.forEach(el => observer.observe(el));