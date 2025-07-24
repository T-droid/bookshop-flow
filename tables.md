const lowStockBooks = [
    { title: "Mathematics Grade 5", currentStock: 3, threshold: 10 },
    { title: "Kiswahili Grade 7", currentStock: 5, threshold: 15 },
    { title: "Science Grade 8", currentStock: 2, threshold: 12 },
  ]

  const recentSales = [
    { receipt: "RCP-001", items: 3, amount: 1250.00, time: "10:30 AM" },
    { receipt: "RCP-002", items: 1, amount: 450.00, time: "11:15 AM" },
    { receipt: "RCP-003", items: 5, amount: 2100.00, time: "2:45 PM" },
  ]

  const books = [
    {
      id: "1",
      isbn: "978-9966-46-123-4",
      title: "Mathematics Grade 5 Learner's Book",
      author: "Jane Wanjiku",
      publisher: "Kenya Literature Bureau",
      grade: "Grade 5",
      subject: "Mathematics",
      quantity: 25,
      priceExclVat: 450.00,
      vatRate: 16,
      priceInclVat: 522.00,
      totalValue: 13050.00,
      lowStockThreshold: 10
    },
    {
      id: "2", 
      isbn: "978-9966-46-567-8",
      title: "Kiswahili Grade 7 Activity Book",
      author: "Peter Kimani",
      publisher: "Longhorn Publishers",
      grade: "Grade 7",
      subject: "Kiswahili",
      quantity: 5,
      priceExclVat: 380.00,
      vatRate: 16,
      priceInclVat: 440.80,
      totalValue: 2204.00,
      lowStockThreshold: 15
    },
    {
      id: "3",
      isbn: "978-9966-46-789-2",
      title: "Science Grade 8 Textbook",
      author: "Mary Njoki",
      publisher: "East African Publishers",
      grade: "Grade 8", 
      subject: "Science",
      quantity: 2,
      priceExclVat: 520.00,
      vatRate: 16,
      priceInclVat: 603.20,
      totalValue: 1206.40,
      lowStockThreshold: 12
    }
  ]

  const publishers = [
    {
      id: "1",
      name: "Kenya Literature Bureau",
      contactPerson: "John Kamau",
      email: "j.kamau@klb.co.ke",
      phone: "+254 20 318262",
      address: "Bellevue, South C, Nairobi",
      totalBooks: 45,
      status: 'active'
    },
    {
      id: "2", 
      name: "Longhorn Publishers",
      contactPerson: "Sarah Wanjiku",
      email: "s.wanjiku@longhorn.co.ke",
      phone: "+254 20 4444722",
      address: "Funzi Road, Industrial Area, Nairobi",
      totalBooks: 32,
      status: 'active'
    },
    {
      id: "3",
      name: "East African Publishers",
      contactPerson: "David Muthuki",
      email: "d.muthuki@eaep.co.ke", 
      phone: "+254 20 2226887",
      address: "Kijabe Street, Nairobi",
      totalBooks: 28,
      status: 'active'
    }
  ]

  const mockSalesData = [
    { period: "January 2024", sales: 45000, transactions: 156, avgOrder: 288.46 },
    { period: "February 2024", sales: 52000, transactions: 178, avgOrder: 292.13 },
    { period: "March 2024", sales: 48500, transactions: 165, avgOrder: 293.94 }
  ]

  const mockBestSellers = [
    { title: "English Grade 5", isbn: "978-9966-25-123-4", unitsSold: 45, revenue: 20250 },
    { title: "Mathematics Grade 3", isbn: "978-9966-25-124-1", unitsSold: 38, revenue: 14440 },
    { title: "Science Grade 7", isbn: "978-9966-25-125-8", unitsSold: 32, revenue: 16640 }
  ]

  const mockLowStock = [
    { title: "Social Studies Grade 6", isbn: "978-9966-25-126-5", current: 5, minimum: 10, status: "Critical" },
    { title: "Kiswahili Grade 4", isbn: "978-9966-25-127-2", current: 8, minimum: 15, status: "Low" },
    { title: "English Grade 8", isbn: "978-9966-25-128-9", current: 12, minimum: 20, status: "Low" }
  ]

  const mockInventoryValue = [
    { category: "Primary Textbooks", value: 125000, vatIncluded: 145000, percentage: 45 },
    { category: "Secondary Textbooks", value: 98000, vatIncluded: 113680, percentage: 35 },
    { category: "Reference Materials", value: 56000, vatIncluded: 64960, percentage: 20 }
  ]

  const mockBooks = [
    { id: "1", title: "English Grade 5", isbn: "978-9966-25-123-4", price: 450, vatRate: 16 },
    { id: "2", title: "Mathematics Grade 3", isbn: "978-9966-25-124-1", price: 380, vatRate: 16 },
    { id: "3", title: "Science Grade 7", isbn: "978-9966-25-125-8", price: 520, vatRate: 16 }
  ]

  const profile = {
    name: "John Mwangi",
    email: "manager@kicd.go.ke",
    phone: "+254 712 345 678",
    position: "Bookshop Manager"
  }

  const notifications = {
    lowStockAlerts: true,
    salesReports: true,
    systemUpdates: false,
    dailyReports: true
  }

  const receiptSettings = {
    headerText: "KICD Bookshop",
    footerText: "Thank you for your purchase!",
    includeVAT: true,
    showItemCodes: true
  }

  const preferences = {
    lowStockThreshold: 10,
    defaultVATRate: 16,
    autoGenerateReceipts: true,
    enableBackups: true
  }

  const taxRates = [
    {
      id: "1",
      name: "Standard VAT",
      rate: 16,
      isDefault: true,
      effectiveDate: "2023-01-01",
      description: "Standard VAT rate for books"
    },
    {
      id: "2", 
      name: "Zero Rated",
      rate: 0,
      isDefault: false,
      effectiveDate: "2023-01-01",
      description: "Zero-rated books (educational materials)"
    }
  ]