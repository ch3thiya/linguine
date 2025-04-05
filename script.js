document.addEventListener('DOMContentLoaded', function() {
    const selectionScreen = document.getElementById('selection-screen');
    const translatorOption = document.getElementById('translator-option');
    const unicodeOption = document.getElementById('unicode-option');
    
    const translatorSection = document.getElementById('translator-section');
    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const sourceLanguage = document.getElementById('source-language');
    const targetLanguage = document.getElementById('target-language');
    const translateButton = document.getElementById('translate-button');
    const swapButton = document.getElementById('swap-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const sourceCount = document.getElementById('source-count');
    const targetCount = document.getElementById('target-count');
    const backFromTranslator = document.getElementById('back-from-translator');
    
    const unicodeSection = document.getElementById('unicode-section');
    const phoneticText = document.getElementById('phonetic-text');
    const unicodeText = document.getElementById('unicode-text');
    const phoneticScheme = document.getElementById('phonetic-scheme');
    const convertButton = document.getElementById('convert-button');
    const clearButton = document.getElementById('clear-button');
    const phoneticCount = document.getElementById('phonetic-count');
    const unicodeCount = document.getElementById('unicode-count');
    const backFromUnicode = document.getElementById('back-from-unicode');
    const unicodeLoadingIndicator = document.getElementById('unicode-loading-indicator');
    
    translatorOption.addEventListener('click', function() {
        selectionScreen.classList.add('hidden');
        translatorSection.classList.remove('hidden');
    });
    
    unicodeOption.addEventListener('click', function() {
        selectionScreen.classList.add('hidden');
        unicodeSection.classList.remove('hidden');
    });
    
    backFromTranslator.addEventListener('click', function() {
        translatorSection.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
    });
    
    backFromUnicode.addEventListener('click', function() {
        unicodeSection.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
    });
    
    
    sourceText.addEventListener('input', function() {
        sourceCount.textContent = `${sourceText.value.length} characters`;
    });

    function decodeHtmlEntities(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }
    
    async function translateText() {
        const text = sourceText.value.trim();
        if (!text) {
            alert('Please enter some text to translate.');
            return;
        }
        
        const sourceLang = sourceLanguage.value;
        const targetLang = targetLanguage.value;
        
        loadingIndicator.classList.add('active');
        
        try {
            const apiKey = AIzaSyDw0KMvl0ku3rfkAjHjZjWq-ruxa0gQdgc;
            const url = 'https://translation.googleapis.com/language/translate/v2';
            
            const params = new URLSearchParams({
                q: text,
                target: targetLang,
                key: apiKey
            });
            
            if (sourceLang !== 'auto') {
                params.append('source', sourceLang);
            }
            
            const response = await fetch(`${url}?${params}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message || 'Translation failed');
            }
            
            const translatedText = data.data.translations[0].translatedText;
            targetText.value = decodeHtmlEntities(translatedText);
            targetCount.textContent = `${targetText.value.length} characters`;
        } catch (error) {
            console.error('Translation error:', error);
            alert('Translation error: ' + error.message);
        } finally {
            loadingIndicator.classList.remove('active');
        }
    }
    
    function swapLanguages() {
        if (sourceLanguage.value === 'auto') {
            alert('Cannot swap when source language is set to "Detect Language"');
            return;
        }
        
        const tempLang = sourceLanguage.value;
        sourceLanguage.value = targetLanguage.value;
        targetLanguage.value = tempLang;
        
        const tempText = sourceText.value;
        sourceText.value = targetText.value;
        targetText.value = tempText;
        
        sourceCount.textContent = `${sourceText.value.length} characters`;
        targetCount.textContent = `${targetText.value.length} characters`;
    }
    
    translateButton.addEventListener('click', translateText);
    swapButton.addEventListener('click', swapLanguages);
    
    sourceText.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            translateText();
        }
    });
    
    
    phoneticText.addEventListener('input', function() {
        phoneticCount.textContent = `${phoneticText.value.length} characters`;
    });
    
    async function convertToUnicode() {
        const text = phoneticText.value.trim();
        if (!text) {
            unicodeText.value = '';
            unicodeCount.textContent = '0 characters';
            return;
        }
        
        unicodeLoadingIndicator.classList.add('active');
        
        try {
            const formData = new FormData();
            formData.append('data', text);
            
            const response = await fetch('https://easysinhalaunicode.com/api/convert', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const convertedText = await response.text();
            unicodeText.value = convertedText;
            unicodeCount.textContent = `${convertedText.length} characters`;
        } catch (error) {
            console.error('Conversion error:', error);
            fallbackConversion(text);
        } finally {
            unicodeLoadingIndicator.classList.remove('active');
        }
    }
    
    function fallbackConversion(text) {
        const commonPhrases = {
            'ayubowan': 'ආයුබෝවන්',
            'kohomada': 'කොහොමද',
            'bohoma': 'බොහොම',
            'sthuthi': 'ස්තූති',
            'subha': 'සුභ',
            'dawasak': 'දවසක්',
            'suba': 'සුභ',
            'pathanawa': 'පතනවා',
            'aluth': 'අලුත්',
            'lanka': 'ලංකා',
            'srilanka': 'ශ්‍රීලංකා',
            'hello': 'හෙලෝ',
            'sinhala': 'සිංහල'
        };
        
        const words = text.split(/\s+/);
        const result = words.map(word => commonPhrases[word.toLowerCase()] || word).join(' ');
        
        unicodeText.value = result;
        unicodeCount.textContent = `${result.length} characters`;
        
        alert('API connection failed. Using basic fallback conversion. For best results, please check your internet connection.');
    }
    
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    const debouncedConversion = debounce(convertToUnicode, 500);
    
    function clearText() {
        phoneticText.value = '';
        unicodeText.value = '';
        phoneticCount.textContent = '0 characters';
        unicodeCount.textContent = '0 characters';
    }
    
    convertButton.addEventListener('click', convertToUnicode);
    clearButton.addEventListener('click', clearText);
    
    phoneticScheme.addEventListener('change', function() {
        if (phoneticScheme.value !== 'singlish') {
            alert('The easysinhalaunicode.com API only supports Singlish format. Your input will be processed as Singlish regardless of this selection.');
        }
        convertToUnicode();
    });
    
    phoneticText.addEventListener('input', debouncedConversion);
});
