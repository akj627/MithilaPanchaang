// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission handling
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Here you would typically send the data to a server
    console.log('Form submitted:', data);
    
    // Show success message
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

// Add scroll-based animations
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    } else {
        header.style.backgroundColor = '#fff';
    }
});

// Mobile menu toggle (you can add this if you want a mobile menu)
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Calendar functionality
document.addEventListener('DOMContentLoaded', function() {
    const calendarBody = document.getElementById('calendarDays');
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    const dateSelectorDropdown = document.getElementById('dateSelectorDropdown');
    const monthItems = document.querySelectorAll('.month-item');
    const yearGrid = document.getElementById('yearGrid');
    const yearRange = document.getElementById('yearRange');
    const prevYearBtn = document.getElementById('prevYear');
    const nextYearBtn = document.getElementById('nextYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const viewButtons = document.querySelectorAll('.view-btn');
    const modal = document.getElementById('dateModal');
    const closeModal = document.querySelector('.close-modal');

    let currentDate = new Date();
    let currentView = 'month';
    let currentYearRange = {
        start: Math.floor(currentDate.getFullYear() / 10) * 10,
        end: Math.floor(currentDate.getFullYear() / 10) * 10 + 9
    };

    let panchangData = null;

    const occasionColors = {
        "Mundan": "#FF6347", // Tomato
        "Upanayan": "#6A5ACD", // SlateBlue
        "Festival": "#3CB371", // MediumSeaGreen
        "Default": "#FFA500" // Orange for any other occasion
    };

    // Load panchang data
    async function loadPanchangData() {
        try {
            const response = await fetch('data/panchang.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            panchangData = await response.json();
            console.log('Panchang data loaded successfully:', panchangData);
            initCalendar();
        } catch (error) {
            console.error('Error loading panchang data:', error);
            // Initialize calendar even if data loading fails
            initCalendar();
        }
    }

    // Initialize calendar
    function initCalendar() {
        updateDateDisplay();
        populateYearGrid();
        updateCalendar();
        setupEventListeners();
    }

    // Update the current date display
    function updateDateDisplay() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames[currentDate.getMonth()];
        const year = currentDate.getFullYear();
        currentDateDisplay.textContent = `${month} ${year}`;
    }

    // Populate year grid with current decade
    function populateYearGrid() {
        yearGrid.innerHTML = '';
        yearRange.textContent = '2020 - 2026';

        for (let year = 2020; year <= 2026; year++) {
            const yearItem = document.createElement('div');
            yearItem.className = 'year-item';
            yearItem.textContent = year;
            yearItem.dataset.year = year;

            if (year === currentDate.getFullYear()) {
                yearItem.classList.add('active');
            }

            yearItem.addEventListener('click', () => {
                currentDate.setFullYear(year);
                updateDateDisplay();
                updateCalendar();
                closeDateSelector();
            });

            yearGrid.appendChild(yearItem);
        }
    }

    // Show date selector dropdown
    function showDateSelector() {
        dateSelectorDropdown.classList.add('active');
        
        // Update active states
        monthItems.forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.month) === currentDate.getMonth());
        });

        // Add click outside listener
        document.addEventListener('click', handleClickOutside);
    }

    // Close date selector dropdown
    function closeDateSelector() {
        dateSelectorDropdown.classList.remove('active');
        document.removeEventListener('click', handleClickOutside);
    }

    // Handle clicks outside the date selector
    function handleClickOutside(event) {
        if (!dateSelectorDropdown.contains(event.target) && !currentDateDisplay.contains(event.target)) {
            closeDateSelector();
        }
    }

    // Function to check if a day is auspicious
    function checkAuspiciousDay(year, month, day) {
        if (!panchangData) return false;
        
        const yearData = panchangData.auspiciousDays[year];
        if (!yearData) return false;
        
        const monthData = yearData[month];
        if (!monthData) return false;
        
        return monthData[day] !== undefined;
    }

    // Get auspicious day details
    function getAuspiciousDayDetails(year, month, day) {
        if (!panchangData) return null;
        
        const yearData = panchangData.auspiciousDays[year];
        if (!yearData) return null;
        
        const monthData = yearData[month];
        if (!monthData) return null;
        
        return monthData[day] || null;
    }

    // Show modal with date details
    function showDateDetails(date) {
        const modalDate = document.getElementById('modalDate');
        const modalTithi = document.getElementById('modalTithi');
        const modalNakshatra = document.getElementById('modalNakshatra');
        const modalMuhurats = document.getElementById('modalMuhurats');
        const modalOccasions = document.getElementById('modalOccasions');

        // Format date for display
        modalDate.textContent = date.toLocaleDateString('default', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Get auspicious day details
        const details = getAuspiciousDayDetails(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

        if (details) {
            modalTithi.textContent = details.tithi;
            modalNakshatra.textContent = details.nakshatra;

            // Muhurat timings
            modalMuhurats.innerHTML = details.muhurats.map(muhurat => `
                <div class="muhurat-item">
                    <div class="muhurat-name">${muhurat.name}</div>
                    <div class="muhurat-time">${muhurat.time}</div>
                    <div class="muhurat-description">${muhurat.description}</div>
                </div>
            `).join('');

            // Special occasions
            modalOccasions.innerHTML = details.occasions.map(occasion => `
                <div class="occasion-item">${occasion}</div>
            `).join('');
        } else {
            modalTithi.textContent = 'No auspicious timings available';
            modalNakshatra.textContent = 'No nakshatra information available';
            modalMuhurats.innerHTML = '<div class="no-data">No muhurat timings available</div>';
            modalOccasions.innerHTML = '<div class="no-data">No special occasions</div>';
        }

        // Show modal
        modal.style.display = 'block';
    }

    // Close modal
    function closeDateModal() {
        modal.style.display = 'none';
    }

    // Setup event listeners
    function setupEventListeners() {
        // Month navigation
        prevMonthBtn.addEventListener('click', () => {
            calendarBody.classList.add('slide-right');
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateDateDisplay();
            updateCalendar();
            setTimeout(() => {
                calendarBody.classList.remove('slide-right');
            }, 300);
        });

        nextMonthBtn.addEventListener('click', () => {
            calendarBody.classList.add('slide-left');
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateDateDisplay();
            updateCalendar();
            setTimeout(() => {
                calendarBody.classList.remove('slide-left');
            }, 300);
        });

        // Month selection from dropdown
        monthItems.forEach(item => {
            item.addEventListener('click', () => {
                const month = parseInt(item.dataset.month);
                currentDate.setMonth(month);
                updateDateDisplay();
                updateCalendar();
                closeDateSelector();
            });
        });

        // View buttons
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                viewButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentView = button.dataset.view;
                updateCalendar();
            });
        });

        // Date selector
        currentDateDisplay.addEventListener('click', showDateSelector);

        // Close modal
        closeModal.addEventListener('click', closeDateModal);
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeDateModal();
            }
        });
    }

    // Update calendar display
    function updateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();

        switch (currentView) {
            case 'month':
                renderMonthView(year, month);
                break;
            case 'week':
                renderWeekView(year, month, day);
                break;
            case 'day':
                renderDayView(year, month, day);
                break;
        }
    }

    // Render month view
    function renderMonthView(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        calendarBody.innerHTML = '';
                
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarBody.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Get day details
            const dayData = getAuspiciousDayDetails(year, month, day);
            const isAuspicious = checkAuspiciousDay(year, month, day);

            const dateNum = document.createElement('div');
            dateNum.classList.add('date-num');
            dateNum.textContent = day;
            dayElement.appendChild(dateNum);

            if (isAuspicious) {
                dayElement.classList.add('auspicious-day');

                if (dayData && dayData.occasions && dayData.occasions.length > 0) {
                    const numOccasions = dayData.occasions.length;
                    const heightPerOccasion = 100 / numOccasions;

                    dayData.occasions.forEach((occasion, index) => {
                        const occasionBar = document.createElement('div');
                        occasionBar.classList.add('occasion-bar');
                        occasionBar.style.height = `${heightPerOccasion}%`;
                        occasionBar.style.backgroundColor = occasionColors[occasion] || occasionColors['Default'];
                        occasionBar.style.top = `${index * heightPerOccasion}%`;
                        dayElement.appendChild(occasionBar);
                    });
                }
            }
            
            // Add click event to show details
            dayElement.addEventListener('click', () => {
                const date = new Date(year, month, day);
                showDateDetails(date);
            });
            
            calendarBody.appendChild(dayElement);
        }
    }

    // Render week view
    function renderWeekView(year, month, day) {
        const weekStart = new Date(year, month, day);
        weekStart.setDate(day - weekStart.getDay());
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        // Update the month-year label
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let dateDisplay = '';
        
        if (weekStart.getMonth() === weekEnd.getMonth()) {
            // Same month
            dateDisplay = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        } else {
            // Different months
            dateDisplay = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        }
        
        currentDateDisplay.textContent = dateDisplay;
        
        const weekContainer = document.createElement('div');
        weekContainer.className = 'week-container';
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(weekStart.getDate() + i);
            
            const dayContainer = document.createElement('div');
            dayContainer.className = 'calendar-day';
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = `${weekDays[i]} ${currentDate.getDate()}`;
            dayContainer.appendChild(dayHeader);
            
            const dayContent = document.createElement('div');
            dayContent.className = 'day-content';
            
            // Check if this is an auspicious day
            const isAuspicious = checkAuspiciousDay(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate()
            );
            
            if (isAuspicious) {
                dayContainer.classList.add('auspicious');
                const muhuratInfo = document.createElement('div');
                muhuratInfo.className = 'muhurat-info';
                muhuratInfo.innerHTML = '⭐ Muhurat Available';
                dayContent.appendChild(muhuratInfo);
            }
            
            dayContainer.appendChild(dayContent);
            dayContainer.onclick = () => showDateDetails(currentDate);
            weekContainer.appendChild(dayContainer);
        }
        
        calendarContainer.innerHTML = '';
        calendarContainer.appendChild(weekContainer);
    }

    // Render day view
    function renderDayView(year, month, day) {
        const currentDate = new Date(year, month, day);
        
        calendarBody.innerHTML = '';
        
        // Create day container
        const dayContainer = document.createElement('div');
        dayContainer.className = 'day-view-container';
        
        // Add date header
        const dateHeader = document.createElement('div');
        dateHeader.className = 'day-view-header';
        dateHeader.textContent = currentDate.toLocaleDateString('default', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        dayContainer.appendChild(dateHeader);
        
        // Check if the day is auspicious
        if (checkAuspiciousDay(year, month, day)) {
            const details = getAuspiciousDayDetails(year, month, day);
            if (details) {
                // Add tithi and nakshatra
                const tithiNakshatra = document.createElement('div');
                tithiNakshatra.className = 'tithi-nakshatra';
                tithiNakshatra.innerHTML = `
                    <div class="tithi">Tithi: ${details.tithi}</div>
                    <div class="nakshatra">Nakshatra: ${details.nakshatra}</div>
                `;
                dayContainer.appendChild(tithiNakshatra);
                
                // Add muhurat timings
                const muhuratContainer = document.createElement('div');
                muhuratContainer.className = 'muhurat-container';
                muhuratContainer.innerHTML = '<h3>Auspicious Timings</h3>';
                
                details.muhurats.forEach(muhurat => {
                    const muhuratElement = document.createElement('div');
                    muhuratElement.className = 'muhurat-item';
                    muhuratElement.innerHTML = `
                        <div class="muhurat-name">${muhurat.name}</div>
                        <div class="muhurat-time">${muhurat.time}</div>
                        <div class="muhurat-description">${muhurat.description}</div>
                    `;
                    muhuratContainer.appendChild(muhuratElement);
                });
                dayContainer.appendChild(muhuratContainer);
                
                // Add special occasions
                if (details.occasions && details.occasions.length > 0) {
                    const occasionsContainer = document.createElement('div');
                    occasionsContainer.className = 'occasions-container';
                    occasionsContainer.innerHTML = '<h3>Special Occasions</h3>';
                    
                    details.occasions.forEach(occasion => {
                        const occasionElement = document.createElement('div');
                        occasionElement.className = 'occasion-item';
                        occasionElement.textContent = occasion;
                        occasionsContainer.appendChild(occasionElement);
                    });
                    dayContainer.appendChild(occasionsContainer);
                }
            }
        } else {
            const noDataMessage = document.createElement('div');
            noDataMessage.className = 'no-data-message';
            noDataMessage.textContent = 'No auspicious timings available for this day';
            dayContainer.appendChild(noDataMessage);
        }
        
        calendarBody.appendChild(dayContainer);
    }

    function createMonthGrid() {
        const monthGrid = document.createElement('div');
        monthGrid.className = 'month-grid';
        
        const months = [
            'January', 'February', 'March',
            'April', 'May', 'June',
            'July', 'August', 'September',
            'October', 'November', 'December'
        ];
        
        months.forEach(month => {
            const monthItem = document.createElement('div');
            monthItem.className = 'month-item';
            monthItem.textContent = month;
            monthItem.addEventListener('click', () => {
                const monthIndex = months.indexOf(month);
                currentDate.setMonth(monthIndex);
                updateCalendar();
                dateSelectorDropdown.classList.remove('active');
            });
            monthGrid.appendChild(monthItem);
        });
        
        return monthGrid;
    }

    function createYearGrid() {
        const yearGrid = document.createElement('div');
        yearGrid.className = 'year-grid';
        
        const startYear = 2020;
        const endYear = 2026;
        
        for (let year = startYear; year <= endYear; year++) {
            const yearItem = document.createElement('div');
            yearItem.className = 'year-item';
            yearItem.textContent = year;
            yearItem.addEventListener('click', () => {
                currentDate.setFullYear(year);
                updateCalendar();
                dateSelectorDropdown.classList.remove('active');
            });
            yearGrid.appendChild(yearItem);
        }
        
        return yearGrid;
    }

    // Update the year navigation buttons to use the fixed range
    function updateYearRange() {
        const yearRange = document.getElementById('yearRange');
        if (yearRange) {
            yearRange.textContent = '2020 - 2026';
        }
    }

    // Remove the year navigation buttons since we have a fixed range
    function createYearSelector() {
        const yearSelector = document.createElement('div');
        yearSelector.className = 'year-selector';
        
        const yearRange = document.createElement('div');
        yearRange.id = 'yearRange';
        yearRange.textContent = '2020 - 2026';
        yearSelector.appendChild(yearRange);
        
        return yearSelector;
    }

    // Start loading panchang data
    loadPanchangData();
}); 