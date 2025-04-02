document.addEventListener('DOMContentLoaded', function() {
    // Selection screen elements
    const selectionScreen = document.getElementById('selection-screen');
    const translatorOption = document.getElementById('translator-option');
    const unicodeOption = document.getElementById('unicode-option');
    
    // Translator section elements
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
    
    // Unicode converter section elements
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
    
    // Navigation between sections
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
    
    // TRANSLATOR FUNCTIONALITY
    
    // Update character count for translator
    sourceText.addEventListener('input', function() {
        sourceCount.textContent = `${sourceText.value.length} characters`;
    });

    // Utility function to decode HTML entities
    function decodeHtmlEntities(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }
    
    // Translation function
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
            // Google Cloud Translation API call
            const apiKey = 'AIzaSyDw0KMvl0ku3rfkAjHjZjWq-ruxa0gQdgc'; // Replace with your actual API key
            const url = 'https://translation.googleapis.com/language/translate/v2';
            
            const params = new URLSearchParams({
                q: text,
                target: targetLang,
                key: apiKey
            });
            
            // Add source language if it's not set to auto-detect
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
    
    // Swap languages
    function swapLanguages() {
        // Don't swap if source is set to auto-detect
        if (sourceLanguage.value === 'auto') {
            alert('Cannot swap when source language is set to "Detect Language"');
            return;
        }
        
        // Swap languages
        const tempLang = sourceLanguage.value;
        sourceLanguage.value = targetLanguage.value;
        targetLanguage.value = tempLang;
        
        // Swap text
        const tempText = sourceText.value;
        sourceText.value = targetText.value;
        targetText.value = tempText;
        
        // Update character counts
        sourceCount.textContent = `${sourceText.value.length} characters`;
        targetCount.textContent = `${targetText.value.length} characters`;
    }
    
    // Event listeners for translator
    translateButton.addEventListener('click', translateText);
    swapButton.addEventListener('click', swapLanguages);
    
    // Also translate when pressing Enter in the source text area
    sourceText.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            translateText();
        }
    });
    
    // UNICODE CONVERTER FUNCTIONALITY
    
    // Update character count for unicode converter
    phoneticText.addEventListener('input', function() {
        phoneticCount.textContent = `${phoneticText.value.length} characters`;
    });
    
    // Function to convert phonetic text to Sinhala Unicode using Easy Sinhala Unicode API
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
            // For better user experience, fall back to basic conversion if API fails
            fallbackConversion(text);
        } finally {
            unicodeLoadingIndicator.classList.remove('active');
        }
    }
    
    // Simple fallback conversion function in case the API fails
    function fallbackConversion(text) {
        // Basic mapping for common words and phrases
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
        
        // Split text into words and try to match with common phrases
        const words = text.split(/\s+/);
        const result = words.map(word => commonPhrases[word.toLowerCase()] || word).join(' ');
        
        unicodeText.value = result;
        unicodeCount.textContent = `${result.length} characters`;
        
        // Alert the user about the fallback
        alert('API connection failed. Using basic fallback conversion. For best results, please check your internet connection.');
    }
    
    // Debounce function to limit API calls during typing
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Debounced conversion for input events
    const debouncedConversion = debounce(convertToUnicode, 500);
    
    // Clear button functionality
    function clearText() {
        phoneticText.value = '';
        unicodeText.value = '';
        phoneticCount.textContent = '0 characters';
        unicodeCount.textContent = '0 characters';
    }
    
    // Event listeners for unicode converter
    convertButton.addEventListener('click', convertToUnicode);
    clearButton.addEventListener('click', clearText);
    
    // Convert on scheme change (note: the provided API only supports Singlish)
    phoneticScheme.addEventListener('change', function() {
        // Show warning if user selects a scheme not supported by the API
        if (phoneticScheme.value !== 'singlish') {
            alert('The easysinhalaunicode.com API only supports Singlish format. Your input will be processed as Singlish regardless of this selection.');
        }
        convertToUnicode();
    });
    
    // Real-time conversion when typing (debounced to avoid too many API calls)
    phoneticText.addEventListener('input', debouncedConversion);
});