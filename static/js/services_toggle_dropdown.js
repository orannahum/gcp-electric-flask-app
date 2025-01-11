document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('.option input[type="checkbox"]');
    const selectedCountSpan = document.querySelector('.selected-count');

    function updateSelectedCount() {
        const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        selectedCountSpan.textContent = selectedCount;
    }

    // selectButton.addEventListener('click', () => {
    //     dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    // });

    // hideButton.addEventListener('click', () => {
    //     dropdown.style.display = 'none';
    // });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
    });
});
