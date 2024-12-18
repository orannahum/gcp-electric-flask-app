function toggleDropdown(event) {
    const dropdown = event.target.closest('.custom-select').querySelector('.select-dropdown');
    const isHidden = dropdown.style.display === 'none';
    dropdown.style.display = isHidden ? 'block' : 'none';
    
    // סגירת הדרופדאון בלחיצה מחוץ לאלמנט
    if (isHidden) {
        document.addEventListener('click', function closeDropdown(e) {
            if (!e.target.closest('.custom-select')) {
                dropdown.style.display = 'none';
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
}

// עדכון הטקסט בכפתור לפי הבחירות
document.querySelectorAll('.option input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const select = this.closest('.custom-select');
        const button = select.querySelector('.select-button');
        const selectedOptions = select.querySelectorAll('input[type="checkbox"]:checked');
        
        if (selectedOptions.length > 0) {
            button.textContent = `נבחרו ${selectedOptions.length} שירותים`;
        } else {
            button.textContent = 'בחר שירותים';
        }
        
        // הוספת החץ חזרה
        const arrow = document.createElement('span');
        arrow.className = 'arrow-down';
        arrow.textContent = '▼';
        button.appendChild(arrow);
    });
});