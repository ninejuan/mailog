const searchInput = document.getElementById('searchInput');
searchInput.addEventListener("keyup", (event) => {
    if (event.key == 'Enter') {
        searchLogs();
    } 
})

function searchLogs() {
    var input = document.getElementById("searchInput").value.toLowerCase();
    var logEntries = document.getElementById("logEntries").innerHTML;
    var lines = logEntries.split("<br>");

    var filteredEntries = lines.filter(function (line) {
        return line.toLowerCase().includes(input);
    });

    document.getElementById("logEntries").innerHTML = filteredEntries.join("<br>")
                                                                .replaceAll(`${input}`, `<span style="background-color: yellow;"><strong>${input}</strong></span>`);
}

function resetPage() {
    location.reload();
}