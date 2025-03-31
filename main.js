$(document).ready(function() {
    const $form = $('#scholarshipForm');
    const $subjectsTable = $('#subjectsTable tbody');
    const $tabs = $('.tab');
    const $tabHeaders = $('.tab-header div');

    // Tab switching logic
    $tabHeaders.on('click', function() {
        const tabId = $(this).data('tab');
        switchTab(tabId);
    });

    // Navigation button events
    $('#nextToMarks').on('click', function() {
        if (validatePersonalTab()) {
            switchTab('marks');
        }
    });

    $('#backToPersonal').on('click', function() {
        switchTab('personal');
    });

    $('#nextToIncome').on('click', function() {
        if (validateMarksTab()) {
            switchTab('income');
        }
    });

    $('#backToMarks').on('click', function() {
        switchTab('marks');
    });

    function switchTab(tabName) {
        let isValid = true;

        // Validate the current tab before switching
        const currentTab = $tabs.filter('.active').attr('id');
        if (currentTab === 'personalTab') {
            isValid = validatePersonalTab();
        } else if (currentTab === 'marksTab') {
            isValid = validateMarksTab();
        }

        if (!isValid) {
            return; // Prevent switching if the current tab is invalid
        }

        // Switch tabs if validation passes
        $tabs.removeClass('active');
        $tabHeaders.removeClass('active');

        $(`#${tabName}Tab`).addClass('active');
        $(`.tab-header div[data-tab="${tabName}"]`).addClass('active');
    }

    // Add a subject row
    function addSubjectRow() {
        // Validate the last row before adding a new one
        const $lastRow = $subjectsTable.find('tr:last');
        if ($lastRow.length && !validateMarksTab()) {
            return; // Do not add a new row if the last row is invalid
        }

        const $rows = $subjectsTable.find('tr');
        const rowCount = $rows.length;
        const $newRow = $(`
        <tr>
           <td>${rowCount + 1}</td>
           <td>
               <input type="text" name="subject_${rowCount}" class="subject-input subject-name" placeholder="Subject name" required>
            </td>
            <td>
              <input type="number" name="totalMarks_${rowCount}" class="subject-input total-marks" placeholder="Total" required min="0">
            </td>
            <td>
              <input type="number" name="score_${rowCount}" class="subject-input score" placeholder="Score" required min="0">
            </td>
            <td><input type="text" name="percentage_${rowCount}" class="subject-input percentage-input" readonly></td>
            <td>
              <button type="button" class="remove-btn">×</button>
            </td>
        </tr>
        `);

        $subjectsTable.append($newRow);
        setupRowEventListeners($newRow);
    }

    // Setup row event listeners
    function setupRowEventListeners($row) {
        const $removeBtn = $row.find('.remove-btn');
        const $totalInput = $row.find('.total-marks');
        const $scoreInput = $row.find('.score');
        const $subjectInput = $row.find('.subject-name');

        $removeBtn.on('click', function () {
            if ($subjectsTable.find('tr').length > 1) {
                $row.remove();
                updateRowNumbers();
            }
        });

        $totalInput.add($scoreInput).add($subjectInput).on('input', function () {
            validateMarksTab(); // Revalidate the row dynamically
            calculatePercentage($row); // Recalculate percentage if applicable
        });
    }

    // Calculate percentage
    function calculatePercentage($row) {
        const $totalInput = $row.find('.total-marks');
        const $scoreInput = $row.find('.score');
        const $percentageInput = $row.find('.percentage-input');
    
        const total = parseFloat($totalInput.val()) || 0;
        const score = parseFloat($scoreInput.val()) || 0;
    
        if (total > 0 && score <= total) {
            const percentage = (score / total * 100).toFixed(1);
            $percentageInput.val(percentage + '%');
        } else if (score > total) {
            $percentageInput.val('Error');
        } else {
            $percentageInput.val('-');
        }
    }

    // Update row numbers
    function updateRowNumbers() {
        const $rows = $subjectsTable.find('tr');
        $rows.each(function(index) {
            $(this).find('td:first').text(index + 1);
        });
    }

    // Add subject button
    $('#addSubjectBtn').on('click', function() {
        const $rows = $subjectsTable.find('tr');

        // Check maximum rows
        if ($rows.length >= 5) {
            $('#subjectsError')
                .text('Maximum 5 subjects allowed')
                .show();
            return;
        } else {
            $('#subjectsError').hide();
        }

        // Add a new row only if the previous row is valid
        addSubjectRow();
    });

    // Validation
    $form.validate({
        errorPlacement: function(error, element) {
            const errorId = "#" + element.attr("id") + "Error";
            $(errorId).text(error.text()).show();
        },
        highlight: function(element) {
            $(element).addClass("error");
            const errorId = "#" + $(element).attr("id") + "Error";
            $(errorId).show();
        },
        unhighlight: function(element) {
            $(element).removeClass("error");
            const errorId = "#" + $(element).attr("id") + "Error";
            $(errorId).hide();
        },
        rules: {
            fullName: {
                required: true,
                lettersonly: true
            },
            age: {
                required: true,
                range: [15, 35]
            },
            parentName: {
                required: true,
                lettersonly: true
            },
            occupation: {
                required: true,
                lettersonly: true
            },
            address: {
                required: true
            },
            relationship: {
                required: true,
                lettersonly: true
            },
            annualIncome: {
                required: true
            },
            requisitionAmount: {
                required: true,
                digits: true
            },
            natureRequisition: {
                required: true,
                lettersonly: true
            },
            fundAmount: {
                required: true,
                digits: true,
                max: function() {
                    return parseFloat($("#requisitionAmount").val()) || 0;
                }
            }
        },
        messages: {
            fullName: {
                required: "Full name is required",
                lettersonly: "Only alphabets are allowed"
            },
            age: {
                required: "Age is required",
                range: "Age must be between 15 and 35"
            }
            // Add other custom messages as needed
        },
        submitHandler: function(form) {
            alert("Form submitted successfully!");
            form.submit();
        }
    });

    // Custom validation method for letters only
    $.validator.addMethod("lettersonly", function(value, element) {
        return this.optional(element) || /^[a-zA-Z\s]+$/.test(value);
    });

    // Custom validation for Personal Tab
    function validatePersonalTab() {
        const personalFields = [
            '#fullName', '#age', '#parentName', 
            '#occupation', '#address', '#relationship'
        ];
        
        let isValid = true;
        personalFields.forEach(field => {
            if (!$(field).valid()) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    // Custom validation for Marks Tab
    function validateMarksTab() {
        const $rows = $subjectsTable.find('tr');
        let isValid = true;

        // Validate each row
        $rows.each(function () {
            const $row = $(this);
            const $subjectName = $row.find('.subject-name');
            const $totalMarks = $row.find('.total-marks');
            const $score = $row.find('.score');

            const subjectName = $subjectName.val().trim();
            const totalMarks = $totalMarks.val().trim();
            const score = $score.val().trim();

            // Validate subject name
            if (!subjectName) {
                isValid = false;
                if (!$subjectName.next('.field-error').length) {
                    $subjectName.after('<span class="field-error">Subject name is required</span>');
                }
            } else {
                $subjectName.next('.field-error').remove();
            }

            // Validate total marks
            if (!totalMarks || isNaN(totalMarks) || parseFloat(totalMarks) <= 0) {
                isValid = false;
                if (!$totalMarks.next('.field-error').length) {
                    $totalMarks.after('<span class="field-error">Enter valid total marks</span>');
                }
            } else {
                $totalMarks.next('.field-error').remove();
            }

            // Validate score
            if (!score || isNaN(score) || parseFloat(score) < 0) {
                isValid = false;
                if (!$score.next('.field-error').length) {
                    $score.after('<span class="field-error">Enter valid score</span>');
                }
            } else if (parseFloat(score) > parseFloat(totalMarks)) {
                isValid = false;
                if (!$score.next('.field-error').length) {
                    $score.after('<span class="field-error">Score cannot exceed total marks</span>');
                }
            } else {
                $score.next('.field-error').remove();
            }
        });

        return isValid;
    }

    // Initialize first subject row
    addSubjectRow();
});