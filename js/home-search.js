// 首页搜索功能，基于主题自带的搜索实现进行改进
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('home-search-input');
    const searchResult = document.getElementById('home-search-result');
    const searchClearBtn = document.getElementById('home-search-clear-btn');
    
    if (!searchInput) {
        console.log('首页搜索输入框未找到');
        return;
    }
    
    let datas = [];
    
    // 加载搜索数据
    loadSearchData();
    
    function loadSearchData() {
        fetch('/search.xml')
            .then(response => response.text())
            .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml'))
            .then(data => {
                datas = [...data.querySelectorAll('entry')].map(entry => {
                    return {
                        title: entry.querySelector('title').textContent,
                        content: entry.querySelector('content').textContent,
                        url: entry.querySelector('url').textContent,
                        date: entry.querySelector('date') ? entry.querySelector('date').textContent : ''
                    };
                });
            })
            .catch(error => {
                console.error('加载搜索数据失败:', error);
            });
    }
    
    // 搜索函数，基于主题自带搜索实现改进
    function search(value) {
        if (!value.trim() || datas.length === 0) {
            searchResult.classList.remove('show');
            searchResult.innerHTML = '';
            return;
        }
        
        const keywords = value.trim().toLowerCase().split(/[\s\-]+/);
        let results = [];
        
        datas.forEach(data => {
            const title = data.title.toLowerCase();
            const content = data.content.toLowerCase().replace(/<[^>]+>/g, '');
            let isMatch = false;
            let matchesScore = 0;
            let matchedKeywords = [];
            
            // 检查标题和内容匹配
            keywords.forEach(keyword => {
                if (keyword.length === 0) return;
                
                const titleIndex = title.indexOf(keyword);
                const contentIndex = content.indexOf(keyword);
                
                if (titleIndex > -1) {
                    matchesScore += 10;  // 标题匹配权重更高
                    if (!matchedKeywords.includes(keyword)) {
                        matchedKeywords.push(keyword);
                    }
                    isMatch = true;
                }
                
                if (contentIndex > -1) {
                    matchesScore += 2;   // 内容匹配权重较低
                    if (!matchedKeywords.includes(keyword)) {
                        matchedKeywords.push(keyword);
                    }
                    isMatch = true;
                }
            });
            
            if (isMatch) {
                results.push({
                    title: data.title,
                    content: data.content,
                    url: data.url,
                    date: data.date,
                    score: matchesScore,
                    matchedKeywords: matchedKeywords
                });
            }
        });
        
        // 按匹配度排序
        results.sort((a, b) => b.score - a.score);
        
        // 显示结果
        displayResults(results);
    }
    
    // 显示搜索结果
    function displayResults(results) {
        if (results.length === 0) {
            searchResult.classList.remove('show');
            searchResult.innerHTML = '';
            return;
        }
        
        let resultHtml = '<ul class="search-result-list">';
        
        results.forEach(result => {
            // 处理标题，高亮匹配的关键词
            let title = result.title;
            result.matchedKeywords.forEach(keyword => {
                const reg = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
                title = title.replace(reg, '<span class="search-keyword">$1</span>');
            });
            
            // 提取匹配内容的片段
            let contentSnippet = '';
            if (result.matchedKeywords.length > 0) {
                const firstKeyword = result.matchedKeywords[0].toLowerCase();
                const contentClean = result.content.replace(/<[^>]+>/g, '');
                const idx = contentClean.toLowerCase().indexOf(firstKeyword);
                
                if (idx !== -1) {
                    const start = Math.max(idx - 50, 0);
                    const end = Math.min(idx + firstKeyword.length + 100, contentClean.length);
                    let snippet = '...' + contentClean.substring(start, end) + '...';
                    
                    // 高亮片段中的关键词
                    result.matchedKeywords.forEach(keyword => {
                        const reg = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
                        snippet = snippet.replace(reg, '<span class="search-keyword">$1</span>');
                    });
                    
                    contentSnippet = snippet;
                } else {
                    contentSnippet = contentClean.substring(0, 100) + (contentClean.length > 100 ? '...' : '');
                }
            } else {
                const contentClean = result.content.replace(/<[^>]+>/g, '');
                contentSnippet = contentClean.substring(0, 100) + (contentClean.length > 100 ? '...' : '');
            }
            
            // 格式化日期
            let dateStr = '';
            if (result.date) {
                const date = new Date(result.date);
                dateStr = date.toLocaleDateString('zh-CN');
            }
            
            resultHtml += `
                <li class="search-result-item">
                    <a href="${result.url}" class="search-result-title">${title}</a>
                    <p class="search-result-content">${contentSnippet}</p>
                    <small class="search-result-date">${dateStr}</small>
                </li>
            `;
        });
        
        resultHtml += '</ul>';
        
        searchResult.innerHTML = resultHtml;
        searchResult.classList.add('show');
    }
    
    // 转义正则表达式特殊字符
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // 搜索输入事件
    searchInput.addEventListener('input', function() {
        const value = this.value.trim();
        if (value.length > 0) {
            if (searchClearBtn) {
                searchClearBtn.style.display = 'block';
            }
        } else {
            if (searchClearBtn) {
                searchClearBtn.style.display = 'none';
            }
        }
        search(value);
    });
    
    // 按键事件
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // 防止表单提交
            search(this.value.trim());
        }
    });
    
    // 点击清空按钮
    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchClearBtn.style.display = 'none';
            search('');
            searchResult.classList.remove('show');
            searchResult.innerHTML = '';
        });
    }
    
    // 点击外部区域隐藏结果
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResult.contains(e.target)) {
            searchResult.classList.remove('show');
        }
    });
});