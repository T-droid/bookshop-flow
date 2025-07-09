import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Building2, Search, Edit, Trash2, Mail, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Publisher {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  totalBooks: number
  status: 'active' | 'inactive'
}

export default function Publishers() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Mock data - in real app this would come from API
  const [publishers, setPublishers] = useState<Publisher[]>([
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
  ])

  const [newPublisher, setNewPublisher] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  })

  const filteredPublishers = publishers.filter(publisher =>
    publisher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    publisher.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddPublisher = () => {
    const publisher: Publisher = {
      id: Date.now().toString(),
      name: newPublisher.name,
      contactPerson: newPublisher.contactPerson,
      email: newPublisher.email,
      phone: newPublisher.phone,
      address: newPublisher.address,
      totalBooks: 0,
      status: 'active'
    }

    setPublishers([...publishers, publisher])
    setNewPublisher({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      notes: ""
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Publisher Added",
      description: `${newPublisher.name} has been successfully added to the system.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Publishers</h1>
          <p className="text-muted-foreground">Manage book publishers and suppliers</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-kicd-navy-light">
              <Plus className="mr-2 h-4 w-4" />
              Add Publisher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Publisher</DialogTitle>
              <DialogDescription>
                Enter the publisher details below. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Publisher Name *</Label>
                <Input
                  id="name"
                  value={newPublisher.name}
                  onChange={(e) => setNewPublisher({...newPublisher, name: e.target.value})}
                  placeholder="e.g., Kenya Literature Bureau"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Person *</Label>
                <Input
                  id="contact"
                  value={newPublisher.contactPerson}
                  onChange={(e) => setNewPublisher({...newPublisher, contactPerson: e.target.value})}
                  placeholder="e.g., John Kamau"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPublisher.email}
                    onChange={(e) => setNewPublisher({...newPublisher, email: e.target.value})}
                    placeholder="contact@publisher.co.ke"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newPublisher.phone}
                    onChange={(e) => setNewPublisher({...newPublisher, phone: e.target.value})}
                    placeholder="+254 20 123456"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newPublisher.address}
                  onChange={(e) => setNewPublisher({...newPublisher, address: e.target.value})}
                  placeholder="Physical address"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newPublisher.notes}
                  onChange={(e) => setNewPublisher({...newPublisher, notes: e.target.value})}
                  placeholder="Additional notes about this publisher"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddPublisher}
                disabled={!newPublisher.name || !newPublisher.contactPerson || !newPublisher.email}
                className="bg-gradient-primary hover:bg-kicd-navy-light"
              >
                Add Publisher
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Publishers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-kicd-navy">{publishers.length}</div>
            <p className="text-xs text-muted-foreground">Active suppliers</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-kicd-coral">
              {publishers.reduce((sum, p) => sum + p.totalBooks, 0)}
            </div>
            <p className="text-xs text-muted-foreground">From all publishers</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Status</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {publishers.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Publishers Directory</CardTitle>
              <CardDescription>Manage your book suppliers and their contact information</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search publishers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Books Supplied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPublishers.map((publisher) => (
                  <TableRow key={publisher.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{publisher.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-48">
                          {publisher.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-foreground">{publisher.contactPerson}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {publisher.email}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {publisher.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {publisher.totalBooks}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={publisher.status === 'active' ? 'default' : 'secondary'}
                        className={publisher.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {publisher.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}